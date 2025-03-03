import requests
import json
import time
from django.utils.text import slugify
from .models import Problem, ProblemExample, DailyChallenge
from django.utils import timezone

class LeetCodeAPIService:
    """
    Service class to interact with LeetCode API
    """
    
    GRAPHQL_ENDPOINT = "https://leetcode.com/graphql"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        })
    
    def get_problem_list(self):
        """
        Get a list of all problems from LeetCode
        """
        query = """
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
            problemsetQuestionList(
                categorySlug: $categorySlug
                limit: $limit
                skip: $skip
                filters: $filters
            ) {
                total
                questions {
                    questionId
                    title
                    titleSlug
                    difficulty
                    topicTags {
                        name
                    }
                    acRate
                    isPaidOnly
                }
            }
        }
        """
        
        variables = {
            "categorySlug": "",
            "limit": 5000,  # Fetch a large number to get all problems
            "skip": 0,
            "filters": {}
        }
        
        data = self._send_graphql_request(query, variables)
        if not data or "problemsetQuestionList" not in data:
            return []
        
        return data["problemsetQuestionList"]["questions"]
    
    def get_problem_details(self, title_slug):
        """
        Get detailed information about a specific problem
        """
        query = """
        query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                title
                titleSlug
                content
                difficulty
                topicTags {
                    name
                }
                exampleTestcases
                categoryTitle
                codeSnippets {
                    lang
                    langSlug
                    code
                }
                stats
                hints
                solution {
                    id
                    content
                    isPaidOnly
                }
                isPaidOnly
                similarQuestions
                metaData
            }
        }
        """
        
        variables = {
            "titleSlug": title_slug
        }
        
        data = self._send_graphql_request(query, variables)
        if not data or "question" not in data:
            return None
        
        return data["question"]
    
    def get_daily_challenge(self):
        """
        Get the daily challenge problem from LeetCode
        """
        query = """
        query questionOfToday {
            activeDailyCodingChallengeQuestion {
                date
                userStatus
                link
                question {
                    questionId
                    title
                    titleSlug
                    difficulty
                    isPaidOnly
                }
            }
        }
        """
        
        data = self._send_graphql_request(query, {})
        if not data or "activeDailyCodingChallengeQuestion" not in data:
            return None
        
        return data["activeDailyCodingChallengeQuestion"]
    
    def _send_graphql_request(self, query, variables):
        """
        Helper method to send GraphQL requests to LeetCode API
        """
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = self.session.post(self.GRAPHQL_ENDPOINT, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                print(f"GraphQL Error: {result['errors']}")
                return None
            
            return result["data"]
        except Exception as e:
            print(f"Error calling LeetCode API: {str(e)}")
            return None
    
    def sync_problems(self):
        """
        Sync problems from LeetCode to our database
        """
        problems = self.get_problem_list()
        count = 0
        
        for problem_data in problems:
            # Sleep briefly to avoid overwhelming the API
            time.sleep(0.5)
            
            # Check if problem already exists
            leetcode_id = problem_data["questionId"]
            try:
                problem = Problem.objects.get(leetcode_id=leetcode_id)
                # Update existing problem
                problem.title = problem_data["title"]
                problem.difficulty = problem_data["difficulty"].lower()
                problem.success_rate = float(problem_data["acRate"])
                problem.is_premium = problem_data["isPaidOnly"]
                problem.save()
            except Problem.DoesNotExist:
                # Get detailed problem information
                details = self.get_problem_details(problem_data["titleSlug"])
                if not details:
                    continue
                
                # Extract tags
                tags = [tag["name"] for tag in problem_data["topicTags"]]
                
                # Create new problem
                problem = Problem.objects.create(
                    leetcode_id=leetcode_id,
                    title=problem_data["title"],
                    slug=problem_data["titleSlug"],
                    difficulty=problem_data["difficulty"].lower(),
                    description=details["content"],
                    category=details.get("categoryTitle", ""),
                    tags=",".join(tags),
                    success_rate=float(problem_data["acRate"]),
                    is_premium=problem_data["isPaidOnly"]
                )
                
                # Create example testcases
                if details.get("exampleTestcases"):
                    examples = details["exampleTestcases"].split("\n")
                    for i, example in enumerate(examples):
                        if example.strip():
                            ProblemExample.objects.create(
                                problem=problem,
                                input_data=example.strip(),
                                order=i+1
                            )
                
                count += 1
                print(f"Added problem: {problem.title}")
        
        print(f"Synced {count} new problems")
        return count
    
    def sync_daily_challenge(self):
        """
        Sync today's daily challenge from LeetCode
        """
        daily = self.get_daily_challenge()
        if not daily:
            return None
        
        today = timezone.now().date()
        
        # Parse the date from LeetCode format (yyyy-MM-dd)
        challenge_date = timezone.datetime.strptime(
            daily["date"], "%Y-%m-%d"
        ).date()
        
        # Get or create the problem
        leetcode_id = daily["question"]["questionId"]
        title_slug = daily["question"]["titleSlug"]
        
        try:
            problem = Problem.objects.get(leetcode_id=leetcode_id)
        except Problem.DoesNotExist:
            # Fetch problem details and create a new problem
            details = self.get_problem_details(title_slug)
            if not details:
                return None
            
            # Extract tags if available
            tags = []
            if "topicTags" in details:
                tags = [tag["name"] for tag in details["topicTags"]]
            
            problem = Problem.objects.create(
                leetcode_id=leetcode_id,
                title=daily["question"]["title"],
                slug=title_slug,
                difficulty=daily["question"]["difficulty"].lower(),
                description=details.get("content", ""),
                category=details.get("categoryTitle", ""),
                tags=",".join(tags),
                success_rate=0.0,  # We don't have this information from the daily challenge API
                is_premium=daily["question"]["isPaidOnly"]
            )
            
            # Create example testcases
            if details.get("exampleTestcases"):
                examples = details["exampleTestcases"].split("\n")
                for i, example in enumerate(examples):
                    if example.strip():
                        ProblemExample.objects.create(
                            problem=problem,
                            input_data=example.strip(),
                            order=i+1
                        )
        
        # Create or update the daily challenge
        daily_challenge, created = DailyChallenge.objects.update_or_create(
            date=challenge_date,
            defaults={"problem": problem}
        )
        
        return daily_challenge