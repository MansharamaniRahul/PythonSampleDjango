from django.conf.urls import  url

from . import views
urlpatterns = [
    url(r'^$', views.getChildTableList, name='getChildTableList'),
]
