<!DOCTYPE html>
<html>
<head>
    <title>Account Approved</title>
</head>
<body>
    <h1>Welcome to Our Platform!</h1>
    <p>Your account has been approved by the administrator.</p>
    <p>Here are your login credentials:</p>
    
    <table>
        <tr>
            <td><strong>Email:</strong></td>
            <td>{{ $email }}</td>
        </tr>
        <tr>
            <td><strong>Password:</strong></td>
            <td>{{ $password }}</td>
        </tr>
    </table>
    
    <p>Please change your password after your first login.</p>
    <p>Best regards,<br>Your Platform Team</p>
</body>
</html>