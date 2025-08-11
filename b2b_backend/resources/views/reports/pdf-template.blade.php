<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>My Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
        }
        .filters {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .filters p {
            margin: 5px 0;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
        }
        th {
            background-color: #2c3e50;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .summary {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .summary h3 {
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ ucfirst(str_replace('_', ' ', $filters['report_type'])) }} Report</h1>
        <p>Generated on: {{ date('F d, Y H:i:s') }}</p>
    </div>

    <div class="filters">
        <p><strong>Report Period:</strong> {{ date('F d, Y', strtotime($filters['from_date'])) }} to {{ date('F d, Y', strtotime($filters['to_date'])) }}</p>
        @if($user)
            <p><strong>User:</strong> {{ $user['first_name'] }} {{ $user['last_name'] }} ({{ $user['email'] }})</p>
        @endif
    </div>

    @if(isset($data['tyfcb']) && count($data['tyfcb']) > 0)
    <div class="section">
        <h2>TYFCB Entries ({{ count($data['tyfcb']) }} records)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Thank You To</th>
                    <th>Amount</th>
                    <th>Business Type</th>
                    <th>Referral Type</th>
                    <th>Comments</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['tyfcb'] as $item)
                <tr>
                    <td>{{ $item['id'] }}</td>
                    <td>{{ $item['thank_you_to'] }}</td>
                    <td>${{ number_format($item['referral_amount'], 2) }}</td>
                    <td>{{ $item['business_type'] }}</td>
                    <td>{{ $item['referral_type'] }}</td>
                    <td>{{ $item['comments'] ?: '-' }}</td>
                    <td>{{ date('M d, Y', strtotime($item['created_at'])) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        @if(isset($summary['tyfcb']))
        <div class="summary">
            <h3>TYFCB Summary</h3>
            <p><strong>Total Entries:</strong> {{ $summary['tyfcb']['total_count'] }}</p>
            <p><strong>Total Amount:</strong> ${{ number_format($summary['tyfcb']['total_amount'], 2) }}</p>
        </div>
        @endif
    </div>
    @endif

    @if(isset($data['referral']) && count($data['referral']) > 0)
    <div class="section">
        <h2>Referral Entries ({{ count($data['referral']) }} records)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Referred To</th>
                    <th>Lead Type</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['referral'] as $item)
                <tr>
                    <td>{{ $item['id'] }}</td>
                    <td>{{ $item['referred_to'] }}</td>
                    <td>{{ $item['lead_type'] }}</td>
                    <td>{{ $item['referral_type'] }}</td>
                    <td>{{ str_replace('_', ' ', $item['referral_status']) }}</td>
                    <td>{{ $item['mobile_number'] ?: '-' }}</td>
                    <td>{{ $item['email'] ?: '-' }}</td>
                    <td>{{ date('M d, Y', strtotime($item['created_at'])) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        @if(isset($summary['referral']))
        <div class="summary">
            <h3>Referral Summary</h3>
            <p><strong>Total Entries:</strong> {{ $summary['referral']['total_count'] }}</p>
        </div>
        @endif
    </div>
    @endif

    @if(isset($data['face_to_face']) && count($data['face_to_face']) > 0)
    <div class="section">
        <h2>Face to Face Entries ({{ count($data['face_to_face']) }} records)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Met With</th>
                    <th>Invited By</th>
                    <th>Location</th>
                    <th>Meeting Date</th>
                    <th>Created Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['face_to_face'] as $item)
                <tr>
                    <td>{{ $item['id'] }}</td>
                    <td>{{ $item['met_with'] }}</td>
                    <td>{{ $item['invited_by'] }}</td>
                    <td>{{ $item['location'] }}</td>
                    <td>{{ date('M d, Y', strtotime($item['date'])) }}</td>
                    <td>{{ date('M d, Y', strtotime($item['created_at'])) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        @if(isset($summary['face_to_face']))
        <div class="summary">
            <h3>Face to Face Summary</h3>
            <p><strong>Total Entries:</strong> {{ $summary['face_to_face']['total_count'] }}</p>
        </div>
        @endif
    </div>
    @endif

    @if((!isset($data['tyfcb']) || count($data['tyfcb']) == 0) && 
        (!isset($data['referral']) || count($data['referral']) == 0) && 
        (!isset($data['face_to_face']) || count($data['face_to_face']) == 0))
    <div class="section">
        <h2>No Data Found</h2>
        <p>No records found for the selected date range and report type.</p>
    </div>
    @endif

    <div class="footer">
        
        <p>Generated for: {{ $user['first_name'] }} {{ $user['last_name'] }}</p>
    </div>
</body>
</html>