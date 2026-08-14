$ErrorActionPreference = "Stop"

$projectPath = (Resolve-Path $PSScriptRoot).Path
$distPath = Join-Path $projectPath "dist"
$clientPath = Join-Path $distPath "client"
$serverPath = Join-Path $distPath "server"

if (-not $distPath.StartsWith($projectPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "La carpeta de salida no pertenece al proyecto."
}

if (Test-Path -LiteralPath $distPath) {
    Remove-Item -LiteralPath $distPath -Recurse -Force
}

New-Item -ItemType Directory -Path $clientPath -Force | Out-Null
New-Item -ItemType Directory -Path $serverPath -Force | Out-Null

$trackedFiles = @(& git -C $projectPath ls-files)
if ($LASTEXITCODE -ne 0) {
    throw "No se pudo obtener la lista de archivos del sitio."
}

$deployableFiles = $trackedFiles | Where-Object {
    $_ -match '\.(?:html|css|js|txt|xml|webmanifest|vcf|png|webp|svg)$' -or
    $_ -in @("_headers", "_redirects")
}

if (Test-Path -LiteralPath (Join-Path $projectPath "button-system.css")) {
    $deployableFiles += "button-system.css"
}

foreach ($relativePath in ($deployableFiles | Sort-Object -Unique)) {
    if ($relativePath -in @("worker/index.js", "build-site.ps1", "local-server.js")) {
        continue
    }

    $sourcePath = Join-Path $projectPath $relativePath
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        throw "Falta un archivo público: $relativePath"
    }

    $destinationPath = Join-Path $clientPath $relativePath
    $destinationDirectory = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Force
}

Copy-Item -LiteralPath (Join-Path $projectPath "worker/index.js") -Destination (Join-Path $serverPath "index.js") -Force

$htmlFiles = @(Get-ChildItem -LiteralPath $clientPath -Filter "*.html" -File)
$missingButtonStyles = @($htmlFiles | Where-Object {
    -not (Select-String -LiteralPath $_.FullName -Pattern 'button-system\.css' -Quiet)
})

if ($missingButtonStyles.Count -gt 0) {
    throw "Hay páginas sin el sistema de botones: $($missingButtonStyles.Name -join ', ')"
}

if (-not (Test-Path -LiteralPath (Join-Path $serverPath "index.js") -PathType Leaf)) {
    throw "No se generó el servidor del sitio."
}

Write-Output "Sitio generado: $($htmlFiles.Count) páginas y $($deployableFiles.Count) archivos públicos."
