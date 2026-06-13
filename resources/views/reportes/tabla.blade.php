<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $titulo }}</title>
<style>
    body { font-family: sans-serif; font-size: 9pt; color: #1e293b; }
    h1 { text-align: center; font-size: 14pt; color: #1e62a0; margin-bottom: 20px; border-bottom: 2px solid #1e62a0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e62a0; color: white; padding: 8px 6px; text-align: left; font-size: 8pt; text-transform: uppercase; }
    td { padding: 5px 6px; border-bottom: 1px solid #e2e8f0; font-size: 8pt; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { text-align: center; margin-top: 20px; font-size: 7pt; color: #94a3b8; }
</style>
</head>
<body>
<h1>{{ $titulo }}</h1>
<table>
    <thead>
        <tr>
            @foreach ($columns as $col)
                <th>{{ $col }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach ($rows as $row)
            <tr>
                @if (is_array($row))
                    @foreach ($row as $cell)
                        <td>{{ $cell }}</td>
                    @endforeach
                @endif
            </tr>
        @endforeach
    </tbody>
</table>
<div class="footer">Generado el {{ now()->format('d/m/Y H:i') }} - CUP FICCT</div>
</body>
</html>
