# VBA — Macro Generation & Management Guide

Load this reference when the task involves: creating Excel macros, writing VBA code, automating Excel workflows, adding buttons/forms, modifying existing macros, or any `.xlsm` deliverable that needs programmatic automation.

Also load `engines/vba-templates.md` for ready-to-use code templates.

---

## Core Principles

### 1. Safety First
- **Never** generate VBA that deletes files, accesses filesystem outside the workbook, or sends data to external URLs without explicit user request
- **Always** include error handling (`On Error GoTo`)
- **Always** add `Application.ScreenUpdating` toggle for performance
- Generated macros must be **read-audit-friendly**: clear naming, comments, structured layout

### 2. openpyxl VBA Workflow
openpyxl can read/preserve/inject VBA but **cannot execute** it. The workflow:

```python
# READ existing VBA
from openpyxl import load_workbook
wb = load_workbook('file.xlsm', keep_vba=True)
# wb.vba_archive contains all VBA modules

# CREATE new .xlsm with VBA
from openpyxl import Workbook
wb = Workbook()
# ... build sheets ...
# Inject VBA via vbaProject.bin (see Injection section)
wb.save('output.xlsm')
```

### 3. File Format Rules
| Need | Format | Extension |
|------|--------|-----------|
| Data only, no macros | OpenXML | `.xlsx` |
| Contains VBA macros | Macro-Enabled | `.xlsm` |
| Binary with macros | Binary | `.xlsb` |

**Critical**: If user gives `.xlsx` but wants macros → output must be `.xlsm`. Always warn about format change.

---

## VBA Code Structure Standard

Every generated VBA module must follow this structure:

```vba
Option Explicit

' ============================================================
' Module: [ModuleName]
' Purpose: [One-line description]
' Author: Z.ai
' Date: [YYYY-MM-DD]
' ============================================================

' --- Constants ---
Private Const MODULE_NAME As String = "[ModuleName]"

' --- Main Entry Point ---
Public Sub Main()
    On Error GoTo ErrHandler
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    ' [Main logic here]

CleanUp:
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    Exit Sub

ErrHandler:
    MsgBox "Error in " & MODULE_NAME & ": " & Err.Description, _
           vbCritical, "Error"
    Resume CleanUp
End Sub
```

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Sub/Function | PascalCase | `GenerateMonthlyReport` |
| Variable | camelCase | `lastRow`, `wsData` |
| Constant | UPPER_SNAKE | `MAX_ROWS`, `REPORT_TITLE` |
| Module | PascalCase | `ModReport`, `ModUtils` |
| Worksheet variable | ws + Name | `wsData`, `wsSummary` |
| Range variable | rng + Desc | `rngData`, `rngHeaders` |

### Variable Declaration Rules
```vba
' Always use explicit types
Dim lastRow As Long          ' Not Integer (row limit)
Dim ws As Worksheet
Dim rng As Range
Dim cell As Range
Dim i As Long
Dim strValue As String
Dim dblAmount As Double
```

---

## Common Patterns

### Find Last Row/Column (Robust)
```vba
' Last row with data in column A
Dim lastRow As Long
lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

' Last column with data in row 1
Dim lastCol As Long
lastCol = ws.Cells(1, ws.Columns.Count).End(xlToLeft).Column

' Used range (less reliable but useful)
Dim usedRows As Long
usedRows = ws.UsedRange.Rows.Count
```

### Loop Through Data
```vba
' Row loop
Dim i As Long
For i = 2 To lastRow  ' Skip header
    If ws.Cells(i, 1).Value <> "" Then
        ' Process row
    End If
Next i

' For Each (range)
Dim cell As Range
For Each cell In ws.Range("A2:A" & lastRow)
    If Not IsEmpty(cell) Then
        ' Process cell
    End If
Next cell
```

### Sheet Operations
```vba
' Reference sheet safely
Dim ws As Worksheet
On Error Resume Next
Set ws = ThisWorkbook.Sheets("Data")
On Error GoTo 0
If ws Is Nothing Then
    MsgBox "Sheet 'Data' not found!", vbExclamation
    Exit Sub
End If

' Create sheet if not exists
Dim wsNew As Worksheet
Dim sheetExists As Boolean
For Each wsNew In ThisWorkbook.Sheets
    If wsNew.Name = "Summary" Then sheetExists = True
Next wsNew
If Not sheetExists Then
    Set wsNew = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    wsNew.Name = "Summary"
End If
```

### User Interaction
```vba
' Simple input
Dim userInput As String
userInput = InputBox("Enter report month (YYYY-MM):", "Month Selection")
If userInput = "" Then Exit Sub

' Confirmation
If MsgBox("Generate report for " & userInput & "?", _
          vbYesNo + vbQuestion, "Confirm") = vbNo Then Exit Sub

' File picker
Dim filePath As Variant
filePath = Application.GetOpenFilename( _
    FileFilter:="Excel Files (*.xlsx;*.xlsm),*.xlsx;*.xlsm", _
    Title:="Select Source File")
If filePath = False Then Exit Sub
```

---

## VBA Injection via openpyxl

### Method 1: Preserve Existing VBA
```python
# Open with VBA preserved
wb = load_workbook('source.xlsm', keep_vba=True)
# Edit data/formatting as usual
wb.save('output.xlsm')  # VBA modules intact
```

### Method 2: Copy VBA from Template
```python
# Use a template .xlsm that already has the VBA you need
import shutil
shutil.copy('template_with_macros.xlsm', 'output.xlsm')
wb = load_workbook('output.xlsm', keep_vba=True)
# Modify data
wb.save('output.xlsm')
```

### Method 3: Manual vbaProject.bin Injection
```python
# For advanced use: inject raw vbaProject.bin
# 1. Create your VBA in Excel, save as .xlsm
# 2. Extract vbaProject.bin from the .xlsm (it's a ZIP)
# 3. Inject into new workbook

import zipfile
import shutil

# Create the workbook first
wb = Workbook()
# ... add data ...
wb.save('temp.xlsx')

# Convert to .xlsm by injecting VBA
shutil.copy('temp.xlsx', 'output.xlsm')
with zipfile.ZipFile('output.xlsm', 'a') as zf:
    zf.write('vbaProject.bin', 'xl/vbaProject.bin')

# Update [Content_Types].xml to register VBA
# (This is fragile — Method 1 or 2 preferred)
```

**Recommendation**: Method 1 (preserve) or Method 2 (template) are robust. Method 3 is fragile and should be last resort.

---

## Security Checklist

Before delivering any VBA-enabled file:

- [ ] No filesystem access outside workbook (no `Kill`, `FileCopy`, `MkDir` unless requested)
- [ ] No network calls (`XMLHTTP`, `WinHttpRequest`) unless requested
- [ ] No shell execution (`Shell`, `WScript.Shell`) unless requested
- [ ] No registry access (`CreateObject("WScript.Shell").RegWrite`)
- [ ] No auto-execution (`Auto_Open`, `Workbook_Open`) unless explicitly requested
- [ ] Error handling in every Sub/Function
- [ ] `ScreenUpdating` restored in cleanup
- [ ] All variables explicitly declared (`Option Explicit`)
- [ ] Module purpose documented in header comment

---

## Performance Guidelines

```vba
' ALWAYS bracket bulk operations
Application.ScreenUpdating = False
Application.Calculation = xlCalculationManual
Application.EnableEvents = False

' [Bulk operations here]

Application.EnableEvents = True
Application.Calculation = xlCalculationAutomatic
Application.ScreenUpdating = True
```

### Array-Based Processing (for large data)
```vba
' Read range into array — much faster than cell-by-cell
Dim data As Variant
data = ws.Range("A1:Z" & lastRow).Value  ' 2D array

' Process in memory
Dim i As Long
For i = LBound(data, 1) To UBound(data, 1)
    data(i, 3) = data(i, 1) * data(i, 2)  ' Column C = A * B
Next i

' Write back in one shot
ws.Range("A1:Z" & lastRow).Value = data
```

---

## Debugging Support

When user reports VBA errors, include diagnostic code:

```vba
' Debug logging to Immediate Window
Debug.Print "Processing row " & i & ": " & ws.Cells(i, 1).Value

' Verbose error info
ErrHandler:
    Debug.Print "ERROR in " & MODULE_NAME
    Debug.Print "  Number: " & Err.Number
    Debug.Print "  Description: " & Err.Description
    Debug.Print "  Source: " & Err.Source
```
