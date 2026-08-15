from django.urls import path
from .views import chat_ai

urlpatterns = [
    path("chat/", chat_ai, name="chat-ai"),
]
