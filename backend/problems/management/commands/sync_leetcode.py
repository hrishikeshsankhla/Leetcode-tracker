from django.core.management.base import BaseCommand
from problems.services import LeetCodeAPIService

class Command(BaseCommand):
    help = 'Sync problems from LeetCode API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Sync all problems (may take a while)',
        )
        parser.add_argument(
            '--daily',
            action='store_true',
            help='Sync only the daily challenge',
        )

    def handle(self, *args, **options):
        service = LeetCodeAPIService()
        
        if options['daily']:
            self.stdout.write("Syncing today's daily challenge...")
            daily = service.sync_daily_challenge()
            if daily:
                self.stdout.write(self.style.SUCCESS(
                    f"Successfully synced daily challenge: {daily.problem.title} for {daily.date}"
                ))
            else:
                self.stdout.write(self.style.ERROR("Failed to sync daily challenge"))
        
        elif options['all']:
            self.stdout.write("Syncing all problems from LeetCode...")
            count = service.sync_problems()
            self.stdout.write(self.style.SUCCESS(
                f"Successfully synced {count} new problems"
            ))
        
        else:
            self.stdout.write("Please specify --all or --daily")