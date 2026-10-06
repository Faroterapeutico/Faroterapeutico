$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("site-stage-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $stage | Out-Null
$node = (Get-Command node -ErrorAction Stop).Source
$prepare = "C:\Users\Aaron\.codex\plugins\cache\openai-curated-remote\sites\0.1.75\skills\sites-hosting\scripts\prepare-site-build.cjs"
& $node $prepare (Get-Location).Path (Join-Path $stage "dist")
if ($LASTEXITCODE -ne 0) { throw "Site build preparation failed." }
New-Item -ItemType Directory -Force -Path (Join-Path $stage "dist/.openai") | Out-Null
Copy-Item ".openai/hosting.json" (Join-Path $stage "dist/.openai/hosting.json") -Force
$archive = Join-Path (Get-Location).Path ".openai/site-deploy-20261005-v2.tar.gz"
tar -C $stage -czf $archive dist
if ($LASTEXITCODE -ne 0) { throw "Archive creation failed." }
$entries = tar -tzf $archive
if (-not ($entries -contains "dist/.openai/hosting.json")) { throw "Archive validation failed." }
Write-Output $archive
