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
    return Response(tempenv.get_template("automata.html").render())

def automata_about(reqiest):
    return Response(tempenv.get_template("automata_about.html").render())

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
        config.add_route("automata about", "/automata/about")
        config.add_view(automata_about, route_name="automata about")

        config.add_static_view(name="/static", path="mysite:/static/")
        config.add_static_view(name="/static/css", path="mysite:/static/css/")
        config.add_static_view(name="/static/js", path="mysite:/static/js/")

        config.scan()
        app = config.make_wsgi_app()

    waitress.serve(app, port=8000)
