#file_storage/management/commands/wait_for_db.py
from django.core.management.base import BaseCommand
import time
import psycopg2
from django.conf import settings


class Command(BaseCommand):
    help = 'Wait for PostgreSQL database to be ready'

    def handle(self, *args, **options):
        self.stdout.write('Waiting for PostgreSQL...')
        max_retries = 30
        retry_delay = 2

        for i in range(max_retries):
            try:
                conn = psycopg2.connect(
                    dbname=settings.DATABASES['default']['NAME'],
                    user=settings.DATABASES['default']['USER'],
                    password=settings.DATABASES['default']['PASSWORD'],
                    host=settings.DATABASES['default']['HOST'],
                    port=settings.DATABASES['default']['PORT']
                )
                conn.close()
                self.stdout.write(self.style.SUCCESS('PostgreSQL is ready!'))
                return
            except psycopg2.OperationalError:
                self.stdout.write(f'Attempt {i+1}/{max_retries}: Database not ready yet...')
                time.sleep(retry_delay)

        self.stdout.write(self.style.ERROR('Could not connect to PostgreSQL'))
        exit(1)