# Brother Printers: IPP Printing

**Last verified:** 2026-09-14 on a Brother MFC-J880DW

Use this guide when fresh discovery identifies a Brother printer with IPP and
the user asks to print.

## Recommended Path

1. Query current IPP capabilities. When advertised, prefer
   `image/pwg-raster` before PDF or JPEG.
2. Generate PWG Raster with standard CUPS tools such as `imagetoraster` and
   `rastertopwg`.
3. Match media, resolution, printable area, and other print options to the
   printer's advertised values. Scale the layout and text for that resolution.
4. Submit it through Home Link as an IPP `Print-Job` with document format
   `image/pwg-raster`. Check the job status and output before retrying.
