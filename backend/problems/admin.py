from django.contrib import admin
from .models import Problem, DailyChallenge, ProblemExample

class ProblemExampleInline(admin.TabularInline):
    model = ProblemExample
    extra = 1

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('leetcode_id', 'title', 'difficulty', 'category', 'success_rate')
    list_filter = ('difficulty', 'category', 'is_premium')
    search_fields = ('title', 'description', 'category', 'tags')
    inlines = [ProblemExampleInline]

@admin.register(DailyChallenge)
class DailyChallengeAdmin(admin.ModelAdmin):
    list_display = ('date', 'problem')
    date_hierarchy = 'date'

