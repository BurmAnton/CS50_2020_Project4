from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    subscriptions = models.ManyToManyField("User", related_name="subscribers")

    def serialize(self, user_id):
        if user_id == self.id:
            subscribe = True 
        else: 
            subscribe = False
        return {
            "id": self.id,
            "user": self.username,
            "subscribers": len([user.id for user in self.subscribers.all()]),
            "subscriptions": len([user.id for user in self.subscriptions.all()]),
            "subscribe": subscribe
        }


class Post(models.Model):
    text = models.TextField()
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField("User", related_name="likes")

    def serialize(self, user_id):
        if user_id == self.user.id:
            edit = True 
        else: 
            edit = False
        return {
            "id": self.id,
            "user": self.user.username,
            "user_id": self.user.id,
            "text": self.text,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": [user.username for user in self.likes.all()],
            "edit": edit
        }

