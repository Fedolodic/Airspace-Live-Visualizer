from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__))
    port = 8000
    print(f"Serving at http://localhost:{port}")
    ThreadingHTTPServer(("", port), SimpleHTTPRequestHandler).serve_forever()
