var frontmatter_add_tag_form = document.querySelector("#frontmatter-add-tag");
var the_input = document.querySelector("#tag_frontmatter_input");
the_input.addEventListener('keydown', function(event){
    if(event.key === "Escape"){
        toggle_frontmatter_tags_form()
    }
});

function toggle_frontmatter_tags_form() {
    var frontmatter_tag_input = document.querySelector("#tag_frontmatter_input");
    document.querySelector(".metadata-tags-add-button").classList.toggle("hidden");
    if (!document.querySelector(".metadata-tags-add-form").classList.toggle("hidden")) {
        // Only focus if it was just shown
        frontmatter_tag_input.focus();
    }
    frontmatter_tag_input.value = "";
}

function submit_frontmatter_tag() {
    current_frontmatter_tags.push(the_input.value)
    current_frontmatter_tags = [...new Set(current_frontmatter_tags)].sort();

    let payload = {
        method: "PUT",
        body: JSON.stringify({
            "tags": current_frontmatter_tags,
        }),
        headers: {
            "content-type": "application/json"
        }
    };

    fetchWithTimeout(`${SCRIPT_ROOT}/dataobjs/frontmatter/${dataobj_id}`, 3000, payload)
    .then(function(response) {
        if (!response.ok) {
            alert("Updating frontmatter was not okay.");
            console.log(response)
        } else {
            if (!response.status == "200") {
                console.log("Response status was "+response.status+" with message "+response.statusText)
            } else {
                console.log("Response was okay!");
                toggle_frontmatter_tags_form();
                populate_frontmatter_tags(current_frontmatter_tags);
            }
        }
    })
    .catch(function(response) {
        console.log(response);
        alert("Timed out!")
    });
}

function populate_frontmatter_tags(tags) {
    // <div class="metadata-tags post-tags">
    // foreach...
    // <span class="post-tag">
    //     <a href="/tags/{{ tag }}">{{ tag }}</a>
    //     <div class="metadata-tags-remove hidden"
    //          onclick="frontmatter_tag_delete('{{ tag }}')">-</div>
    // </span>
    var metadata_tags = document.querySelector(".metadata-tags");
    metadata_tags.innerHTML = "";
    for (i=0; i < tags.length; i++) {
        let this_tag = tags[i];

        let new_tag_span = document.createElement("span")
        new_tag_span.classList.add("post-tag")

        let new_link = document.createElement("a")
        new_link.href = "/tags/" + this_tag;
        new_link.innerHTML = this_tag;

        let delete_link = document.createElement("div")
        delete_link.classList.toggle("metadata-tags-remove")
        delete_link.classList.toggle("hidden")
        delete_link.onclick = function(){frontmatter_tag_delete(this_tag)};
        delete_link.innerHTML = "-"

        new_tag_span.appendChild(new_link);
        new_tag_span.appendChild(delete_link);
        metadata_tags.appendChild(new_tag_span)
    }
}

frontmatter_add_tag_form.onsubmit = function(e) {
    e.preventDefault();
    submit_frontmatter_tag();
};

// Deleting tags
function toggle_frontmatter_tags_delete() {
    document.querySelectorAll(".metadata-tags-remove").forEach(el => {
        el.classList.toggle("hidden")
    });
}

function frontmatter_tag_delete(tag) {
    current_frontmatter_tags = current_frontmatter_tags.filter(function(value, index, arr) {
        return value !== tag
    });

    let payload = {
        method: "PUT",
        body: JSON.stringify({
            "tags": current_frontmatter_tags,
        }),
        headers: {
            "content-type": "application/json"
        }
    };

    response = fetch(`${SCRIPT_ROOT}/dataobjs/frontmatter/${dataobj_id}`, payload);
    populate_frontmatter_tags(current_frontmatter_tags);
    toggle_frontmatter_tags_delete();
}