from django.urls import path
from .views import execute_code, push_github, health_check

urlpatterns = [
    path("execute/", execute_code, name="execute-code"),
    path("git-push/", push_github, name="git-push"),
    path("health/", health_check, name="health-check"),
]
