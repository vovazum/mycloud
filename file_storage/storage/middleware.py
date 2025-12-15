class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Разрешаем запросы с любого origin в разработке
        origin = request.headers.get('Origin')
        if origin and origin in [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8000', 
            'http://127.0.0.1:8000',
        ]:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        
        return response