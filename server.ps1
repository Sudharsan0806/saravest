$port = 8085
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "====================================================" -ForegroundColor Green
Write-Host "  SARAVEST LOCALHOST SERVER RUNNING AT:" -ForegroundColor White
Write-Host "  http://localhost:$port/" -ForegroundColor Yellow
Write-Host "  http://127.0.0.1:$port/" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Green

$root = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $filePath = Join-Path $root $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".png"  { $response.ContentType = "image/png" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } elseif ($urlPath -eq "/api/leads" -and $request.HttpMethod -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            Write-Host "[PS SERVER] Lead Received: $body" -ForegroundColor Cyan
            
            try {
                $payloadToForward = if ($body.Trim().StartsWith("[")) { $body } else { "[$body]" }

                # Target 1: heewyxwpvgytooarfpcp (sales_mandate_inquiries)
                try {
                    $url1 = "https://heewyxwpvgytooarfpcp.supabase.co/rest/v1/sales_mandate_inquiries"
                    $key1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlZXd5eHdwdmd5dG9vYXJmcGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjU2NjEsImV4cCI6MjEwMjA0MTY2MX0.-RsxFahCNx7Ph3ZHrDq9gDyiqAKn7YwPyKNyJ_X0SOU"
                    $h1 = @{ "Content-Type"="application/json"; "apikey"=$key1; "Authorization"="Bearer $key1"; "Prefer"="return=representation" }
                    $res1 = Invoke-RestMethod -Uri $url1 -Method Post -Headers $h1 -Body $payloadToForward
                    Write-Host "[PS SERVER -> SUPABASE 1 (heewyxwpvgytooarfpcp)] SUCCESSFUL INSERT!" -ForegroundColor Green
                } catch {
                    Write-Host "[PS SERVER -> SUPABASE 1] Note: $($_.Exception.Message)" -ForegroundColor Yellow
                }

                # Target 2: ozmvemetjpohyirfqyji (partner_with_us)
                try {
                    $url2 = "https://ozmvemetjpohyirfqyji.supabase.co/rest/v1/partner_with_us"
                    $key2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bXZlbWV0anBvaHlpcmZxeWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUzMDIxMCwiZXhwIjoyMTAyMTA2MjEwfQ.cgCCCCOjHyvo36Rw02YEN8ZkV7h2Hca1WVP92J52sas"
                    $h2 = @{ "Content-Type"="application/json"; "apikey"=$key2; "Authorization"="Bearer $key2"; "Prefer"="return=representation" }
                    $res2 = Invoke-RestMethod -Uri $url2 -Method Post -Headers $h2 -Body $payloadToForward
                    Write-Host "[PS SERVER -> SUPABASE 2 (ozmvemetjpohyirfqyji)] SUCCESSFUL INSERT!" -ForegroundColor Green
                } catch {
                    Write-Host "[PS SERVER -> SUPABASE 2] Note: $($_.Exception.Message)" -ForegroundColor Yellow
                }

            } catch {
                Write-Host "[PS SERVER -> SUPABASE] Forward Note: $($_.Exception.Message)" -ForegroundColor Yellow
            }

            $jsonResp = '{"success":true,"message":"Enquiry submitted successfully!"}'
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResp)
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 201
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    } catch {
        Write-Host "[PS SERVER] Request handled" -ForegroundColor Gray
    }
}
