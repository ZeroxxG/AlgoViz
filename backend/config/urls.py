from django.urls import path, include

urlpatterns = [
    path("api/", include("executor.urls")),
    path("api/", include("ai.urls")),
]
