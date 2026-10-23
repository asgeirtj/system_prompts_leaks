# VBA Code Templates

Ready-to-use VBA templates for common automation tasks. Copy and customize.

Load `scenes/vba.md` first for code standards and injection workflow.

---

## Template 1: Auto-Generate Monthly Report

```vba
Option Explicit

' ============================================================
' Module: ModMonthlyReport
' Purpose: Auto-generate monthly summary from raw data sheet
' ============================================================

Public Sub GenerateMonthlyReport()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    Dim wsData As Worksheet
    Dim wsSummary As Worksheet
    Dim lastRow As Long
    Dim reportMonth As String

    ' Get target month
    reportMonth = InputBox("Enter month (YYYY-MM):", "Report Month", Format(Date, "YYYY-MM"))
    If reportMonth = "" Then GoTo CleanUp

    ' Reference sheets
    Set wsData = ThisWorkbook.Sheets("Data")

    ' Create or clear summary sheet
    On Error Resume Next
    Set wsSummary = ThisWorkbook.Sheets("Summary_" & reportMonth)
    On Error GoTo ErrHandler

    If wsSummary Is Nothing Then
        Set wsSummary = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
        wsSummary.Name = "Summary_" & reportMonth
    Else
        wsSummary.Cells.Clear
    End If

    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row

    ' Write headers
    wsSummary.Range("A1").Value = "Monthly Report: " & reportMonth
    wsSummary.Range("A1").Font.Size = 16
    wsSummary.Range("A1").Font.Bold = True

    wsSummary.Range("A3").Value = "Category"
    wsSummary.Range("B3").Value = "Total Amount"
    wsSummary.Range("C3").Value = "Count"
    wsSummary.Range("D3").Value = "Average"

    ' Aggregate by category (using Dictionary)
    Dim dict As Object
    Set dict = CreateObject("Scripting.Dictionary")

    Dim i As Long
    Dim cat As String
    Dim amt As Double

    For i = 2 To lastRow
        ' Filter by month (assuming date in column A, category in B, amount in C)
        If Format(wsData.Cells(i, 1).Value, "YYYY-MM") = reportMonth Then
            cat = CStr(wsData.Cells(i, 2).Value)
            amt = CDbl(wsData.Cells(i, 3).Value)

            If dict.Exists(cat) Then
                dict(cat) = Array(dict(cat)(0) + amt, dict(cat)(1) + 1)
            Else
                dict.Add cat, Array(amt, 1)
            End If
        End If
    Next i

    ' Write results
    Dim outRow As Long
    outRow = 4
    Dim key As Variant
    For Each key In dict.Keys
        wsSummary.Cells(outRow, 1).Value = key
        wsSummary.Cells(outRow, 2).Value = dict(key)(0)
        wsSummary.Cells(outRow, 2).NumberFormat = "#,##0.00"
        wsSummary.Cells(outRow, 3).Value = dict(key)(1)
        wsSummary.Cells(outRow, 4).Value = dict(key)(0) / dict(key)(1)
        wsSummary.Cells(outRow, 4).NumberFormat = "#,##0.00"
        outRow = outRow + 1
    Next key

    ' Auto-fit columns
    wsSummary.Columns("A:D").AutoFit

    MsgBox "Report generated: " & dict.Count & " categories", vbInformation

CleanUp:
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    Exit Sub

ErrHandler:
    MsgBox "Error: " & Err.Description, vbCritical
    Resume CleanUp
End Sub
```

---

## Template 2: Batch Process Multiple Sheets

```vba
Option Explicit

' ============================================================
' Module: ModBatchProcess
' Purpose: Apply same operation to all data sheets
' ============================================================

Public Sub BatchProcessSheets()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    Dim ws As Worksheet
    Dim processedCount As Long

    For Each ws In ThisWorkbook.Worksheets
        ' Skip non-data sheets
        If Left(ws.Name, 1) <> "_" And ws.Name <> "Summary" And ws.Name <> "Config" Then
            Call ProcessSingleSheet(ws)
            processedCount = processedCount + 1
        End If
    Next ws

    MsgBox processedCount & " sheets processed.", vbInformation

CleanUp:
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Error on sheet '" & ws.Name & "': " & Err.Description, vbCritical
    Resume CleanUp
End Sub

Private Sub ProcessSingleSheet(ws As Worksheet)
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    ' Example: Add a "Total" row at the bottom
    Dim lastCol As Long
    lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column

    Dim totalRow As Long
    totalRow = lastRow + 1

    ws.Cells(totalRow, 1).Value = "Total"
    ws.Cells(totalRow, 1).Font.Bold = True

    Dim col As Long
    For col = 2 To lastCol
        ' Only sum if column contains numbers
        If IsNumeric(ws.Cells(2, col).Value) Then
            ws.Cells(totalRow, col).Formula = "=SUM(" & _
                ws.Cells(2, col).Address & ":" & ws.Cells(lastRow, col).Address & ")"
            ws.Cells(totalRow, col).Font.Bold = True
        End If
    Next col
End Sub
```

---

## Template 3: Data Validation & Cleanup

```vba
Option Explicit

' ============================================================
' Module: ModDataCleanup
' Purpose: Validate and clean data, log issues
' ============================================================

Public Sub ValidateAndClean()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    Dim wsData As Worksheet
    Dim wsLog As Worksheet
    Dim lastRow As Long
    Dim logRow As Long
    Dim issueCount As Long

    Set wsData = ThisWorkbook.Sheets("Data")
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row

    ' Create log sheet
    On Error Resume Next
    Application.DisplayAlerts = False
    ThisWorkbook.Sheets("ValidationLog").Delete
    Application.DisplayAlerts = True
    On Error GoTo ErrHandler

    Set wsLog = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    wsLog.Name = "ValidationLog"
    wsLog.Range("A1:D1").Value = Array("Row", "Column", "Issue", "Original Value")
    logRow = 2

    Dim i As Long
    For i = 2 To lastRow
        ' Check: Empty required fields (columns A-C)
        Dim col As Long
        For col = 1 To 3
            If IsEmpty(wsData.Cells(i, col)) Or Trim(CStr(wsData.Cells(i, col).Value)) = "" Then
                wsLog.Cells(logRow, 1).Value = i
                wsLog.Cells(logRow, 2).Value = wsData.Cells(1, col).Value
                wsLog.Cells(logRow, 3).Value = "Empty required field"
                logRow = logRow + 1
                issueCount = issueCount + 1
            End If
        Next col

        ' Check: Numeric column D should be positive
        If Not IsEmpty(wsData.Cells(i, 4)) Then
            If Not IsNumeric(wsData.Cells(i, 4).Value) Then
                wsLog.Cells(logRow, 1).Value = i
                wsLog.Cells(logRow, 2).Value = wsData.Cells(1, 4).Value
                wsLog.Cells(logRow, 3).Value = "Non-numeric value"
                wsLog.Cells(logRow, 4).Value = wsData.Cells(i, 4).Value
                logRow = logRow + 1
                issueCount = issueCount + 1
            ElseIf CDbl(wsData.Cells(i, 4).Value) < 0 Then
                wsLog.Cells(logRow, 1).Value = i
                wsLog.Cells(logRow, 2).Value = wsData.Cells(1, 4).Value
                wsLog.Cells(logRow, 3).Value = "Negative value"
                wsLog.Cells(logRow, 4).Value = wsData.Cells(i, 4).Value
                logRow = logRow + 1
                issueCount = issueCount + 1
            End If
        End If

        ' Clean: Trim whitespace from text columns
        For col = 1 To 3
            If Not IsEmpty(wsData.Cells(i, col)) Then
                Dim cleaned As String
                cleaned = Trim(CStr(wsData.Cells(i, col).Value))
                If cleaned <> CStr(wsData.Cells(i, col).Value) Then
                    wsData.Cells(i, col).Value = cleaned
                End If
            End If
        Next col
    Next i

    ' Format log
    wsLog.Columns("A:D").AutoFit
    wsLog.Range("A1:D1").Font.Bold = True

    If issueCount > 0 Then
        wsLog.Activate
        MsgBox issueCount & " issues found. See ValidationLog sheet.", vbExclamation
    Else
        MsgBox "All data validated. No issues found.", vbInformation
    End If

CleanUp:
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Error: " & Err.Description, vbCritical
    Resume CleanUp
End Sub
```

---

## Template 4: Multi-File Consolidation

```vba
Option Explicit

' ============================================================
' Module: ModConsolidate
' Purpose: Merge data from multiple Excel files into one sheet
' ============================================================

Public Sub ConsolidateFiles()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False

    ' Let user select files
    Dim files As Variant
    files = Application.GetOpenFilename( _
        FileFilter:="Excel Files (*.xlsx;*.xlsm),*.xlsx;*.xlsm", _
        Title:="Select Files to Consolidate", _
        MultiSelect:=True)

    If Not IsArray(files) Then
        MsgBox "No files selected.", vbInformation
        GoTo CleanUp
    End If

    Dim wsDest As Worksheet
    Set wsDest = ThisWorkbook.Sheets("Consolidated")
    wsDest.Cells.Clear

    Dim destRow As Long
    destRow = 1
    Dim headerWritten As Boolean

    Dim fileIndex As Long
    For fileIndex = LBound(files) To UBound(files)
        Dim wbSource As Workbook
        Set wbSource = Workbooks.Open(CStr(files(fileIndex)), ReadOnly:=True)

        Dim wsSource As Worksheet
        Set wsSource = wbSource.Sheets(1)  ' First sheet

        Dim srcLastRow As Long
        srcLastRow = wsSource.Cells(wsSource.Rows.Count, "A").End(xlUp).Row

        Dim srcLastCol As Long
        srcLastCol = wsSource.Cells(1, wsSource.Columns.Count).End(xlToLeft).Column

        ' Copy header from first file only
        If Not headerWritten Then
            wsSource.Range(wsSource.Cells(1, 1), wsSource.Cells(1, srcLastCol)).Copy _
                Destination:=wsDest.Cells(destRow, 1)
            ' Add "Source File" column
            wsDest.Cells(destRow, srcLastCol + 1).Value = "Source File"
            destRow = destRow + 1
            headerWritten = True
        End If

        ' Copy data rows
        If srcLastRow >= 2 Then
            wsSource.Range(wsSource.Cells(2, 1), wsSource.Cells(srcLastRow, srcLastCol)).Copy _
                Destination:=wsDest.Cells(destRow, 1)

            ' Tag source file
            Dim r As Long
            For r = destRow To destRow + srcLastRow - 2
                wsDest.Cells(r, srcLastCol + 1).Value = Dir(CStr(files(fileIndex)))
            Next r

            destRow = destRow + srcLastRow - 1
        End If

        wbSource.Close SaveChanges:=False
    Next fileIndex

    wsDest.Columns.AutoFit
    MsgBox "Consolidated " & UBound(files) - LBound(files) + 1 & " files, " & _
           destRow - 2 & " data rows.", vbInformation

CleanUp:
    Application.ScreenUpdating = True
    Exit Sub

ErrHandler:
    MsgBox "Error: " & Err.Description, vbCritical
    If Not wbSource Is Nothing Then wbSource.Close SaveChanges:=False
    Resume CleanUp
End Sub
```

---

## Template 5: Button-Triggered Automation

```vba
' ============================================================
' In ThisWorkbook module — create button on sheet
' ============================================================

' Add button programmatically (run once):
Sub CreateRunButton()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Dashboard")

    Dim btn As Button
    Set btn = ws.Buttons.Add(Left:=10, Top:=10, Width:=120, Height:=36)
    btn.Caption = "Generate Report"
    btn.OnAction = "ModMonthlyReport.GenerateMonthlyReport"
    btn.Font.Size = 11
End Sub
```

---

## Template 6: Protected Sheet with Editable Ranges

```vba
Option Explicit

' ============================================================
' Module: ModProtection
' Purpose: Lock sheet but allow editing in specific ranges
' ============================================================

Public Sub SetupProtection()
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Input")

    ' First unlock everything
    ws.Unprotect Password:="admin123"
    ws.Cells.Locked = True

    ' Unlock editable ranges
    ws.Range("C5:C20").Locked = False     ' Input cells
    ws.Range("E5:E20").Locked = False     ' Comment cells

    ' Visual hint: light yellow for editable cells
    ws.Range("C5:C20").Interior.Color = RGB(255, 255, 230)
    ws.Range("E5:E20").Interior.Color = RGB(255, 255, 230)

    ' Protect with options
    ws.Protect Password:="admin123", _
        DrawingObjects:=True, _
        Contents:=True, _
        Scenarios:=True, _
        AllowFormattingCells:=False, _
        AllowInsertingRows:=False, _
        AllowDeletingRows:=False, _
        AllowSorting:=True, _
        AllowFiltering:=True, _
        AllowUsingPivotTables:=False

    MsgBox "Sheet protected. Editable ranges highlighted in yellow.", vbInformation
End Sub
```
