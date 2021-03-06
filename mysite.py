
#mysite.py
"""
Personal website, should act as portfolio and blog
lets try to get some cool javascript up
"""
import waitress
from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.renderers import render_to_response
from jinja2 import Environment, PackageLoader, select_autoescape

import os

PATH = os.getcwd()

tempenv = Environment(
    loader=PackageLoader("mysite", "templates"),
    autoescape=select_autoescape(['html', 'xml'])
)

def main(request):
    return Response(tempenv.get_template("main.html").render())

def blog_response(request):
    blogpath = PATH + "/blogs/"
    blogs = [f for f in os.listdir(blogpath) if os.path.isfile(blogpath+f)]
    for i in range(len(blogs)):
        blogs[i] = blogs[i][:blogs[i].index(".")]
    return Response(tempenv.get_template("blog.html").render(blogs=blogs))

def a_blog(request):
    date = request.matchdict['date']
    blogpath = PATH + "/blogs/" + date + ".txt"
    try:
        with open(blogpath, "r") as f:
            blog = f.read()
    except:
        return blog_response(request)
    return Response(tempenv.get_template("a_blog.html").render(date=date, blog=blog))

def automata(request):
    return Response(tempenv.get_template("automata.html").render(rule=""))

def lifelike(request):
    return Response(tempenv.get_template("lifelike.html").render())

def a_automata(request):
    rule = request.matchdict["rule"]
    return Response(tempenv.get_template("automata.html").render(rule=rule))

def automata_about(reqiest):
    return Response(tempenv.get_template("automata_about.html").render())

def automata_builder(request):
    return Response(tempenv.get_template("automata_builder.html").render())

def maze(request):
    return Response(tempenv.get_template("maze.html").render())

def coolpic(request):
    return Response(tempenv.get_template("coolpic.html").render())

def get_LURD(request):
    with open("LURD.py") as f:
        LURD = f.read()
    return Response(LURD)

if __name__ == "__main__":
    with Configurator() as config:
        config.add_route("main", "/")
        config.add_view(main, route_name="main")

        config.add_route("blog", "/blog")
        config.add_view(blog_response, route_name="blog")
        config.add_route("a blog", "/blog/{date}")
        config.add_view(a_blog, route_name="a blog")

        config.add_route("automata", "/automata")
        config.add_view(automata, route_name="automata")
        config.add_route("a automata", "/automata/rule/{rule}")
        config.add_view(a_automata, route_name="a automata")
        config.add_route("automata about", "/automata/about")
        config.add_view(automata_about, route_name="automata about")
        config.add_route("automata builder", "/automata/builder")
        config.add_view(automata_builder, route_name="automata builder")
        config.add_route("maze", "/maze")
        config.add_view(maze, route_name="maze")


        config.add_route("lifelike", "/lifelike")
        config.add_view(lifelike, route_name="lifelike")

        config.add_route("coolpic", "/coolpic")
        config.add_view(coolpic, route_name="coolpic")

        config.add_route("LURD", "/LURD")
        config.add_view(get_LURD, route_name="LURD")
        
        config.add_static_view(name="/static", path="mysite:/static/")
        config.add_static_view(name="/static/css", path="mysite:/static/css/")
        config.add_static_view(name="/static/js", path="mysite:/static/js/")
        config.add_static_view(name="/static/img", path="mysite:/static/img/")

        config.scan()
        app = config.make_wsgi_app()

    waitress.serve(app, port=8000)
