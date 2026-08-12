"""
Saravest Local Python Server
"""
import http.server
import socketserver
import json
import os
import sys
import mimetypes

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(DIRECTORY, 'public')

SUPABASE_REST_URL = 'https://ozmvemetjpohyirfqyji.supabase.co/rest/v1/partner_with_us'
SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUzMDIxMCwiZXhwIjoyMTAyMTA6MjEwfQ.cgCCCCOjHyvo36Rw02YEN8ZkV7h2Hca1WVP92J52sas'

def forward_to_supabase(lead_dict):
    try:
        payload = json.dumps([lead_dict]).encode('utf-8')
        req = urllib.request.Request(SUPABASE_REST_URL, data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('apikey', SUPABASE_SERVICE_ROLE_KEY)
        req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_ROLE_KEY}')
        req.add_header('Prefer', 'return=representation')
        
        with urllib.request.urlopen(req) as resp:
            body_res = resp.read().decode('utf-8')
            print(f"[NEW SUPABASE SUCCESS] HTTP {resp.status} Created Row in partner_with_us!")
            return True, resp.status, body_res
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"[NEW SUPABASE ERROR {e.code}] {err_msg}")
        return False, e.code, err_msg
    except Exception as ex:
        print(f"[NEW SUPABASE EXCEPTION] {ex}")
        return False, 500, str(ex)
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/'):
            self.send_error(404, "API endpoint not found")
            return

        clean_path = self.path.split('?')[0].split('#')[0]
        if clean_path in ('/', '', '/index.html'):
            target = os.path.join(PUBLIC_DIR, 'index.html')
            if not os.path.exists(target):
                target = os.path.join(DIRECTORY, 'index.html')
        else:
            rel = clean_path.lstrip('/')
            target = os.path.join(PUBLIC_DIR, rel)
            if not os.path.exists(target):
                target = os.path.join(DIRECTORY, rel)

        if os.path.exists(target) and os.path.isfile(target):
            mime_type, _ = mimetypes.guess_type(target)
            if not mime_type:
                if target.endswith('.css'): mime_type = 'text/css'
                elif target.endswith('.js'): mime_type = 'application/javascript'
                elif target.endswith('.jpg') or target.endswith('.jpeg'): mime_type = 'image/jpeg'
                elif target.endswith('.png'): mime_type = 'image/png'
                else: mime_type = 'text/html'

            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            with open(target, 'rb') as f:
                content = f.read()
            try:
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            except Exception as e:
                pass
        else:
            self.send_error(404, f"File not found: {self.path}")

    def do_POST(self):
        if self.path == '/api/leads':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8') or '{}')
                lead_record = {
                    "developer_firm_name": str(payload.get('developer_firm_name') or 'Direct Inquiry').strip(),
                    "contact_person": str(payload.get('contact_person') or 'Anonymous').strip(),
                    "phone_number": str(payload.get('phone_number') or '').strip(),
                    "work_email": str(payload.get('work_email') or '').strip(),
                    "project_category": str(payload.get('project_category') or 'General Real Estate Mandate').strip(),
                    "project_location_units": str(payload.get('project_location_units') or '').strip(),
                    "mandate_requirements_message": str(payload.get('mandate_requirements_message') or '').strip()
                }

                print(f"[PYTHON SERVER] Processing lead for partner_with_us: {lead_record['developer_firm_name']} ({lead_record['contact_person']})")
                ok, status_code, sb_res = forward_to_supabase(lead_record)

                self.send_response(200 if ok else 400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()

                response_obj = {
                    "success": ok,
                    "supabaseStatus": status_code,
                    "message": "Lead forwarded to partner_with_us" if ok else f"Error: {sb_res}",
                    "data": sb_res
                }
                self.wfile.write(json.dumps(response_obj).encode('utf-8'))
                return

            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                return

        self.send_error(404, "Endpoint not found")

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SaravestHandler) as httpd:
        print(f"[SARAVEST PYTHON BACKEND SERVER] Running on http://localhost:{PORT}")
        httpd.serve_forever()
