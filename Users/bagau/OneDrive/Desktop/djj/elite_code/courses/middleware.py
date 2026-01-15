# courses/middleware.py
class DisableSecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Forcefully remove headers that block YouTube
        response['X-Frame-Options'] = 'ALLOWALL'
        response['Content-Security-Policy'] = "frame-ancestors *"
        return response