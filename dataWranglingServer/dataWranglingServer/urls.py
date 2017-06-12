"""dataWranglingServer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include,url
from django.contrib import admin


urlpatterns = [
    url(r'^mongoServer/getLookupTableList/',include('mongoServer.getLookupTableList.urls')),
    url(r'^mongoServer/getImpalaBuiltInLibrary/',include('mongoServer.getImpalaBuiltInLibrary.urls')),    
    url(r'^mongoServer/getFilterList/',include('mongoServer.getFilterList.urls')),
    url(r'^mongoServer/getLoopUpConditionsList/',include('mongoServer.getConditionsList.urls')),
    url(r'^mongoServer/getImpalaBuiltInLibrary/',include('mongoServer.getImpalaBuiltInLibrary.urls')),
    url(r'^mongoServer/saveData/',include('mongoServer.saveData.urls')),
    url(r'^mongoServer/saveDataFromExternalURL/', include('mongoServer.saveDataFromExternalURL.urls')),
    url(r'^impalaServer/saveData/',include('impalaServer.saveData.urls')),
    url(r'^impalaServer/previewData/',include('impalaServer.previewData.urls')),
    url(r'^impalaServer/getChildTableList/', include('impalaServer.getChildTableList.urls')),
    url(r'^impalaServer/getTableDescription/', include('impalaServer.getTableDescription.urls')),
    url(r'^impalaServer/csv/', include('impalaServer.csv.urls')),
    url(r'^admin/', admin.site.urls),
]
