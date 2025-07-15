aws_region= 

db_username=
db_password=

project_name="cloudvault"  
environment="prod"

// Secred encryption must match the pattern: /^[a-zA-Z0-9_+]+$/
aes_key=

// JWT secret
jwt_secret=

// AWS ACM certificate ARN (if you want to use custom domain)
acm_certificate_arn=

// DNS name for the application (eg wxample.com) must be registered with a registrar
dns_name=

// Parameters for Webauthn authentication, https://simplewebauthn.dev/docs/ check for more details
rp_name=
rp_id=
rp_origin=

sns_email_source= // Email address to use as the source for SNS notifications