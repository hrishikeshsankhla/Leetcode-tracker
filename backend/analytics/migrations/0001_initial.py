# Generated by Django 5.1.6 on 2025-03-01 06:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('groups', '0001_initial'),
        ('submissions', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyMotivation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quote', models.TextField()),
                ('author', models.CharField(blank=True, max_length=255)),
                ('date', models.DateField(unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read', models.BooleanField(default=False)),
                ('notification_type', models.CharField(choices=[('streak', 'Streak Reminder'), ('achievement', 'Achievement'), ('group', 'Group Activity'), ('feedback', 'Feedback Received'), ('system', 'System Message')], max_length=20)),
                ('related_group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='groups.group')),
                ('related_submission', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='submissions.submission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ranking_percentile', models.FloatField(default=0)),
                ('consistency_score', models.FloatField(default=0)),
                ('problem_solving_score', models.FloatField(default=0)),
                ('code_quality_score', models.FloatField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='stats', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='DailyActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('problems_solved', models.IntegerField(default=0)),
                ('easy_solved', models.IntegerField(default=0)),
                ('medium_solved', models.IntegerField(default=0)),
                ('hard_solved', models.IntegerField(default=0)),
                ('total_submissions', models.IntegerField(default=0)),
                ('streak_maintained', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'date')},
            },
        ),
    ]
