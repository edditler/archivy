import re

from flask import current_app
from archivy import helpers, data
from tinydb import Query, operations
from archivy.search import query_ripgrep_tags


def is_tag_format(tag_name):
    return re.match("^[a-zA-Z0-9_-]+$", tag_name)


def get_all_tags(force=False):
    db = helpers.get_db()
    list_query = db.search(Query().name == "tag_list")

    # If the "tag_list" doesn't exist in the database: create it.
    newly_created = list_query == []
    if newly_created:
        db.insert({"name": "tag_list", "val": []})

    # Then update it if needed
    tags = []
    if newly_created or force:
        tags = list(query_ripgrep_tags())
        frontmatter_tags = get_frontmatter_tags()
        all_tags = list(set(tags + frontmatter_tags))

        db.update(operations.set("val", all_tags), Query().name == "tag_list")
    else:
        all_tags = list_query[0]["val"]
    return all_tags


def add_tag_to_index(tag_name):
    all_tags = get_all_tags()
    if tag_name not in all_tags:
        all_tags.append(tag_name)
        db = helpers.get_db()
        db.update(operations.set("val", all_tags), Query().name == "tag_list")
    return True


def get_frontmatter_tags():
    all_dataobjs = data.get_items(structured=False, load_content=False)
    frontmatter_tags = []
    for dataobj in all_dataobjs:
        for tag in dataobj['tags']:
            frontmatter_tags.append(tag)
    return frontmatter_tags


def get_databoj_with_tag(tag_name):
    all_dataobjs = data.get_items(structured=False, load_content=False)
    dataobjs = []
    for dataobj in all_dataobjs:
        if tag_name in dataobj['tags']:
            dataobjs.append(dataobj)

    return dataobjs
