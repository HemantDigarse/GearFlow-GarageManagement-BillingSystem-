$ErrorActionPreference = 'Stop'
$ppt = 'D:\GearFlow\output\presentations\GearFlow_DevOps_Architecture.ppt'
$pdf = 'D:\GearFlow\.presentation-build\GearFlow_DevOps_Architecture_legacy_check.pdf'
$app = New-Object -ComObject PowerPoint.Application
$app.Visible = 1
$app.WindowState = 2
try {
  $presentation = $app.Presentations.Open($ppt, -1, 0, 0)
  $presentation.SaveAs($pdf, 32)
  $presentation.Close()
} finally {
  $app.Quit()
  [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
$bytes = [System.IO.File]::ReadAllBytes($ppt)
"PPT_SIGNATURE=$([BitConverter]::ToString($bytes[0..7]))"
"PPT_BYTES=$($bytes.Length) PDF_BYTES=$((Get-Item -LiteralPath $pdf).Length)"
