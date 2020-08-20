
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("compose", views.compose, name="compose"),
    path("user/check", views.cheсk_user_login, name="cheсk_user"),
    path("posts/<str:page_type>/<int:page_number>", views.posts, name="posts"),
    path("posts/user/<int:user_id>/<int:page_number>", views.user_posts, name="user_posts"),
    path("post/<int:post_id>", views.post, name="post"),
    path("post/like/<int:post_id>", views.like, name="like"),
    path("user/<int:user_id>", views.user, name="user"),
    path("user/subscribe/<int:user_id>", views.subscribe, name="subscribe"),
]
