import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def cheсk_user_login(request):
    if user is not None:
        return JsonResponse({"login": True})
    else:
        return JsonResponse({"login": False})

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def compose(request):
    if request.method == "POST":
        data = json.loads(request.body)
        text = data.get("text", "")
        email = Post(
            user=request.user,
            text=text
        )
        email.save()
        return JsonResponse({"message": "Post submit successfully."}, status=201)
    elif request.method == "PUT":
        data = json.loads(request.body)
        text = data.get("text", "")
        post_id = data.get("post_id", "")
        post = Post.objects.get(pk=post_id)
        post.text = text
        post.save()
        return JsonResponse({"message": "Post change successfully."}, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
def posts(request, page_type, page_number):
    if page_type == "all":
        posts = Post.objects.all()
    elif page_type == "follow":
        users = User.objects.filter(
            subscribers=request.user
        )
        posts = Post.objects.filter(
            user__in=users
        )
    else:
        return JsonResponse({"error": "Invalid request."}, status=400)
    posts = posts.order_by("-timestamp").all()  
    posts = Paginator(posts, 10)
    posts_page = posts.get_page(page_number)
    pages = posts.num_pages
    return JsonResponse({"posts": [post.serialize(request.user.id) for post in posts_page], "num_pages": pages}, safe=False)

@csrf_exempt
def user_posts(request, user_id, page_number):
    posts = Post.objects.filter(
            user=User.objects.get(pk=user_id)
        )
    posts = posts.order_by("-timestamp").all()   
    posts = Paginator(posts, 10)
    posts_page = posts.get_page(page_number)
    pages = posts.num_pages
    return JsonResponse({"posts": [post.serialize(request.user.id) for post in posts_page], "num_pages": pages}, safe=False)

@csrf_exempt
@login_required
def post(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    if request.method == "GET":
        return JsonResponse(post.serialize(request.user.id))
    
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("like") == True:
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)
        post.save()
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_exempt
def like(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    if request.user in post.likes.all():
        return JsonResponse(True, safe=False)
    return JsonResponse(False, safe=False)

@csrf_exempt
def user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    if request.method == "GET":
        return JsonResponse(user.serialize(request.user.id))

@csrf_exempt
@login_required
def subscribe(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    if request.method == "GET":
        if user in request.user.subscriptions.all():
            return JsonResponse(True, safe=False)
        return JsonResponse(False, safe=False)

    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("subscribe") == True:
            user.subscribers.add(request.user)
        else:
            user.subscribers.remove(request.user)
        user.save()
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
    
