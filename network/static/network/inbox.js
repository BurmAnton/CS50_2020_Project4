document.addEventListener('DOMContentLoaded', function() {
    fetch(`/user/check`)
    .then(response => response.json())
    .then(login =>{
        if (login){
            document.querySelector('#compose').addEventListener('click', compose_post);
            document.querySelector('#follow').addEventListener('click', () => load_posts('follow', 1));
            document.querySelector('#user').addEventListener('click', () => {
                load_profile(document.querySelector('#user_id').innerHTML);
            });
        }
    });
    document.querySelector('#all').addEventListener('click', () => load_posts('all', 1));
    document.querySelector('#compose-form').onsubmit = () => {
        send_post();
    };
    document.querySelector('#edit-view').onsubmit = () => {
        send_post_changes();
    };
    load_posts('all', 1);
});

function compose_post() {
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'none';
    document.querySelector('#edit-view').style.display = 'none';
    document.querySelector('#pagination').innerHTML = "";
    
    document.querySelector('#index_header').innerHTML = "<h3>New post</h3>";
    document.querySelector('#post-text').value = '';
}

function send_post() {
    fetch('/compose', {
        method: 'POST',
        body: JSON.stringify({
            text: document.querySelector("#post-text").value
        })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
            load_posts('all', 1);
    });
}

function load_posts(view, page_number) {
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#index_header').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#edit-view').style.display = 'none';
    document.querySelector('#index_header').innerHTML = `<h3>${view.charAt(0).toUpperCase() + view.slice(1)}</h3>`;
    document.querySelector('#posts-view').innerHTML = "";

    fetch(`/posts/${view}/${page_number}`)
    .then(response => response.json())
    .then(posts => {
        posts.posts.forEach(post => {
            load_post(post, posts.num_pages, view, page_number);
        });
    });
}

function load_post(post, posts_num_pages, view, page_number) {
    let post_card = document.createElement('div');
    post_card.classList.add("card", "w-50");

    let post_body = document.createElement('div');
    post_body.classList.add("card-body");

    let header = document.createElement('div');
    header.classList.add("d-flex");
    header.classList.add("justify-content-between");
    header.classList.add("align-items-baseline");
    post_body.append(header);

    let button = document.createElement('button');
    button.classList.add("btn", "btn-link");
    post_body.append(button);

    let author = document.createElement('h5');
    author.classList.add("card-title");
    author.innerHTML = post.user;
    author.addEventListener('click', () => load_profile(post.user_id));
    button.append(author);
    
    let timestamp = document.createElement('small');
    timestamp.classList.add("text-muted");
    timestamp.innerHTML = post.timestamp;
    header.append(timestamp);

    let text = document.createElement('p');
    text.classList.add("card-text");
    text.innerHTML = post.text;
    post_body.append(text);

    div = document.createElement('div');
    div.classList.add("d-flex");
    div.classList.add("justify-content-end");
    post_body.append(div);

    if (post.edit) {
        let edit = document.createElement('button');
        edit.classList.add("btn", "btn-sm", "btn-outline-primary", "edit");
        edit.innerHTML = "edit";
        fetch(`/user/check`)
        .then(response => response.json())
        .then(login =>{
            if (login) {
                edit.addEventListener('click', () => edit_post(post));
            }
        });
        div.append(edit);
    }

    unlike = like_button(false, post.id, post.likes.length);
    unlike.style.display = 'none';
    div.append(unlike);

    like = like_button(true, post.id, post.likes.length);
    like.style.display = 'none';
    div.append(like);

    post_card.append(post_body);
    document.querySelector('#posts-view').append(post_card);
    load_like(post.id);
    if (posts_num_pages > 1) {
        document.getElementById("pagination").innerHTML = "";
        pagination(posts_num_pages, view, page_number);
    }
}

function load_user_posts(user_id, page_number) {
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#index_header').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#edit-view').style.display = 'none';

    document.getElementById("pagination").innerHTML = "";
    document.querySelector('#posts-view').innerHTML = "";

    fetch(`posts/user/${user_id}/${page_number}`)
    .then(response => response.json())
    .then(posts => {
        posts.posts.forEach(post => {
            load_post(post);
        });
    });
}

function load_like(post_id) {
    fetch('post/' + 'like/' + post_id)
    .then(response => response.json())
    .then(like => {
        if (like) {
            document.getElementById("unlike" + post_id).style.display = 'block';
            document.getElementById("like" + post_id).style.display = 'none';
        } else {
            document.getElementById("unlike" + post_id).style.display = 'none';
            document.getElementById("like" + post_id).style.display = 'block';
        };
    });
}
    
function change_like(post_id, like, likes) {
    fetch('/post/' + post_id, {
        method: 'PUT',
        body: JSON.stringify({
            like: like
        })
    });
    if (like) {
        document.getElementById("like" + post_id).style.display = 'none';
        document.getElementById("like_count" + post_id).innerHTML++;

        document.getElementById("unlike" + post_id).style.display = 'block';
        document.getElementById("unlike_count" + post_id).innerHTML++;

    } else {
        document.getElementById("unlike" + post_id).style.display = 'none';
        document.getElementById("unlike_count" + post_id).innerHTML--;

        document.getElementById("like" + post_id).style.display = 'block';
        document.getElementById("like_count" + post_id).innerHTML--;

    };
}



function edit_post(post) {
    document.querySelector('#index_header').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'none';
    document.querySelector('#edit-view').style.display = 'block';
    document.querySelector('#pagination').style.display = 'none';
    
    document.querySelector('#index_header').innerHTML = "Edit Post";
    document.querySelector('#post-id').value = post.id;
    document.querySelector('#post-edit').value = post.text;
}

function like_button(like, post_id, likes) {
    let button = document.createElement('button');
    button.classList.add("btn", "btn-sm", "align-self-end");
    span = document.createElement('span');
    span.innerHTML = likes;
    if (like) {
        button.classList.add("btn-outline-danger");
        button.innerHTML = "♥ ";
        button.append(span);
        button.setAttribute("id", "unlike" + post_id);
        span.setAttribute("id", "unlike_count" + post_id);  
        button.disabled = true;
    } else {
        button.classList.add("btn-dark");
        button.innerHTML = "♥ ";
        button.append(span);
        button.setAttribute("id", "like" + post_id);
        span.setAttribute("id", "like_count" + post_id);
        button.disabled = true;
    }
    fetch(`/user/check`)
    .then(response => response.json())
    .then(login =>{
        if (login){
            if (like) {
                button.addEventListener('click', () => change_like(post_id, false, likes));
                button.disabled = false;
            } 
            else {
                button.addEventListener('click', () => change_like(post_id, true, likes));
                button.disabled = false;
            }
        }
    });
    return button;
}

function load_profile(user_id) {
    document.querySelector('#index_header').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'block';
    
    fetch('user/' + user_id)
    .then(response => response.json())
    .then(user => {
        let user_card = document.createElement('div');
        user_card.classList.add("card", "w-50", "text-white", "bg-dark");

        let header = document.createElement('div');
        header.classList.add("card-header", "d-flex", "justify-content-between");
        user_card.append(header);

        let username = document.createElement('h5');
        username.innerHTML = user.user;
        header.append(username);

        fetch(`/user/check`)
        .then(response => response.json())
        .then(login =>{
            if (login){
                if (user.subscribe === false) {
                    let unsubscribe = subscribe_button(user.id, false);
                    unsubscribe.style.display = 'none';
                    header.append(unsubscribe );
            
                    let subscribe = subscribe_button(user.id, true);
                    subscribe.style.display = 'none';
                    header.append(subscribe );
                    load_subscribe(user.id);
                }
            }
            });

        let card_body = document.createElement('div'); 
        card_body.classList.add("card-body");
        user_card.append(card_body);

        let  div = document.createElement('div');
        div.classList.add("d-flex", "justify-content-around");
        card_body.append(div);

        let subscribers = document.createElement('p');
        subscribers.classList.add("card-text");
        subscribers.innerHTML = `<b>${user.subscribers}</b> <span id="Followers">Followers</span>`;
        div.append(subscribers);

        let subscriptions = document.createElement('p');
        subscriptions.classList.add("card-text");
        subscriptions.innerHTML = `<b>${user.subscriptions}</b> <span id="Following">Following</span>`;
        div.append(subscriptions);

        document.querySelector('#profile-view').innerHTML = "";
        document.querySelector('#profile-view').append(user_card);

        load_user_posts(user.id, 1);
    });
}

function subscribe_button(user_id, subscribe) {
    let button = document.createElement('button');
    button.classList.add("btn");
    button.classList.add("btn-sm");
    if (subscribe) {
        button.classList.add("btn-light");
        button.innerHTML = "Unfollow";
        button.setAttribute("id", "unsubscribe" + user_id);
        button.addEventListener('click', () => change_subscribe(user_id, false));
    } else {
        button.classList.add("btn-outline-light");
        button.innerHTML = "Follow";
        button.setAttribute("id", "subscribe" + user_id);
        button.addEventListener('click', () => change_subscribe(user_id, true));
    }
    return button;
}

function load_subscribe(user_id) {
    fetch('user/' + 'subscribe/' + user_id)
    .then(response => response.json())
    .then(subscribe => {
        if (subscribe) {
            document.getElementById("unsubscribe" + user_id).style.display = 'block';
            document.getElementById("subscribe" + user_id).style.display = 'none';
        } else {
            document.getElementById("unsubscribe" + user_id).style.display = 'none';
            document.getElementById("subscribe" + user_id).style.display = 'block';
        };
    });
}

function change_subscribe(user_id, subscribe) {
    fetch('/user/subscribe/' + user_id, {
        method: 'PUT',
        body: JSON.stringify({
            subscribe: subscribe
        })
    });
    if (subscribe) {
        document.getElementById("unsubscribe" + user_id).style.display = 'block';
        document.getElementById("subscribe" + user_id).style.display = 'none';
    } else {
        document.getElementById("unsubscribe" + user_id).style.display = 'none';
        document.getElementById("subscribe" + user_id).style.display = 'block';
    };
}

function pagination(num_pages, view, page_number) {
    let back = document.createElement('li');
    back.classList.add("page-item");

    let a_back = document.createElement('a');
    a_back.classList.add("page-link");
    a_back.setAttribute("aria-label", "Previous");
    if (page_number === 1) {
        back.classList.add("page-item", "disabled");
        a_back.setAttribute("aria-disabled", "true");
    } else {
        if (view === 'all' || view === 'follow') {
            back.addEventListener('click', () => load_posts(view, page_number-1));
        } else {
            back.addEventListener('click', () =>load_user_posts(view, page_number-1));
        }
    }
    back.append(a_back);

    let span_back = document.createElement('span');
    span_back.setAttribute("aria-hidden", "true");
    span_back.innerHTML = "&laquo;";
    a_back.append(span_back);
    document.getElementById("pagination").append(back);

    for (let num = 1; num <= num_pages; num++) {
        document.getElementById("pagination").append(number(num, page_number, view));
    }

    let forward = document.createElement('li');
    forward.classList.add("page-item");

    let a_forward = document.createElement('a');
    a_forward.classList.add("page-link");
    a_forward.setAttribute("aria-label", "Previous");
    if (page_number === num_pages) {
        forward.classList.add("page-item", "disabled");
        a_forward.setAttribute("aria-disabled", "true");
    } else {
        if (view === 'all' || view === 'follow') {
            forward.addEventListener('click', () => load_posts(view, page_number+1));
        } else {
            forward.addEventListener('click', () =>load_user_posts(view, page_number+1));
        }    
    }
    forward.append(a_forward);

    let span_forward = document.createElement('span');
    span_forward.setAttribute("aria-hidden", "true");
    span_forward.innerHTML = "&raquo;";
    a_forward.append(span_forward);
    document.getElementById("pagination").append(forward);
}

function number(num, page_number, view) {
    let li = document.createElement('li');
    li.classList.add("page-item");

    if (view === 'all' || view === 'follow') {
        li.addEventListener('click', () => load_posts(view, num));
    } else {
        li.addEventListener('click', () =>load_user_posts(view, num));
    }

    let a = document.createElement('a');
    a.classList.add("page-link");
    li.append(a);

    if (page_number === num) {
        let span = document.createElement('span');
        span.innerHTML = num;
        a.append(span);
        li.classList.add("active");
        li.setAttribute("aria-current", "page");
    } else {
        a.innerHTML = num;
    }
    return li;
}

function send_post_changes() {
    fetch('/compose', {
        method: 'PUT',
        body: JSON.stringify({
            post_id: document.querySelector("#post-id").value,
            text: document.querySelector("#post-edit").value
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
          load_posts('all', 1);
      });  
}