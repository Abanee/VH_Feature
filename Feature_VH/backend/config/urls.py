"""URL configuration for the project."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from api.views import api_root

def favicon(request):
    """Return a 204 No Content response for favicon requests."""
    return HttpResponse(status=204)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('favicon.ico', favicon, name='favicon'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
