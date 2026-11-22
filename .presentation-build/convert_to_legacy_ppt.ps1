$ErrorActionPreference = 'Stop'
$pptx = 'D:\GearFlow\output\presentations\GearFlow_DevOps_Architecture_Validated.pptx'
$ppt = 'D:\GearFlow\output\presentations\GearFlow_DevOps_Architecture.ppt'
$pdf = 'D:\GearFlow\.presentation-build\GearFlow_DevOps_Architecture_legacy_check.pdf'
$app = New-Object -ComObject PowerPoint.Application
$app.Visible = 1
$app.WindowState = 2
try {
  $presentation = $app.Presentations.Open($pptx, -1, 0, 0)
  $presentation.SaveAs($ppt, 1)
  $presentation.ExportAsFixedFormat($pdf, 2)
  $presentation.Close()
} finally {
  $app.Quit()
  [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
$bytes = [System.IO.File]::ReadAllBytes($ppt)
$signature = [BitConverter]::ToString($bytes[0..7])
$pdfInfo = Get-Item -LiteralPath $pdf | Select-Object Length
$pptInfo = Get-Item -LiteralPath $ppt | Select-Object Length
"PPT_SIGNATURE=$signature"
"PPT_BYTES=$($pptInfo.Length) PDF_BYTES=$($pdfInfo.Length)"
