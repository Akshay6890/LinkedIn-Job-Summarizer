# LinkedIn-Job-Summarizer
LinkedIn Job Feedback Summarizer, which analyses all the feedback from different users on a job posting and gives a summary!

### Steps to Set Up the Project

## Part 1: Set Up Amazon EC2 Instance
1. **Log in to AWS Console**:
   - Go to [AWS Console](https://aws.amazon.com) and log in with your credentials.

2. **Search for EC2**:
   - Use the search bar to find "EC2" and click on the EC2 service.

3. **Launch an EC2 Instance**:
   - Click on "Launch Instance" to start creating an EC2 instance.
   - Configure the instance as required (e.g., Amazon Linux AMI).
   - Create a key pair for SSH access and download the `.pem` file.

4. **Start the Instance**:
   - After configuration, click "Launch Instance" and wait for the instance to start.
   - Ensure the status is "Running" before proceeding.

5. **Configure Security Group**:
   - Go to the "Security" tab of your instance.
   - Edit inbound rules to allow:
     - Custom TCP, port 5000, and source as "My IP" for security.
   - Save the rules.

6. **SSH into the EC2 Instance**:
   - Open a terminal and use the command:
     ```bash
     ssh -i <key_pair_name.pem> ec2-user@<public_ip_address_of_the_ec2_instance>
     ```
   - Replace `<key_pair_name.pem>` with your key file and `<public_ip_address>` with the instance's IP address.

7. **Install Required Software**:
   - Run the following commands:
     ```bash
     sudo yum update -y
     sudo yum install python3 -y
     python3 -m ensurepip --upgrade
     pip3 install flask nltk boto3
     ```

## Part 2: Deploy Python API Service

#### Steps to Address `<give_>` Placeholders Before Uploading `api.py` to EC2

The `api.py` script includes several placeholders (`<give_region>`, `<give_secret_key>`, `<give_access_key>`, `<give_bucket_name>`) that need to be replaced with appropriate values for the script to work correctly. Here's how to address each of them:

1. **AWS Region (`<give_region>`)**:
   - Replace `<give_region>` with the AWS region where your S3 bucket is hosted. For example, `us-west-1` or `us-east-2`.

2. **AWS Secret Key (`<give_secret_key>`)**:
   - Replace `<give_secret_key>` with the **Access Key ID** of your IAM user.

3. **AWS Access Key (`<give_access_key>`)**:
   - Replace `<give_access_key>` with the **Secret Access Key** of your IAM user.
   - Ensure you create a dedicated IAM user with permissions to access S3 and provide its credentials here.

4. **S3 Bucket Name (`<give_bucket_name>`)**:
   - Replace `<give_bucket_name>` with the name of your S3 bucket where feedback data will be stored.

### Steps to Replace the Values
1. Open `api.py` in any text editor.
2. Locate the placeholders (`<give_...>`) in the following lines:
   ```python
   s3 = boto3.client('s3', region_name='<give_region>',
                     aws_access_key_id='<give_secret_key>',
                     aws_secret_access_key='<give_access_key>')
   BUCKET_NAME = "<give_bucket_name>"
   ```
3. Replace the placeholders with actual values. For example:
   ```python
   s3 = boto3.client('s3', region_name='us-west-1',
                     aws_access_key_id='YOUR_ACCESS_KEY_ID',
                     aws_secret_access_key='YOUR_SECRET_ACCESS_KEY')
   BUCKET_NAME = "my-feedback-bucket"
   ```
4. Save the file.

### Additional Precautions
- Ensure the IAM user has the required permissions:
  - Access to the S3 bucket.
  - Permission to perform `GetObject` and `PutObject` operations.
- Keep the keys secure and avoid hardcoding them in the script if possible. Consider using AWS SDK with environment variables or IAM roles for better security practices.

### Proceed with EC2 Deployment
After replacing the placeholders:
1. Use the `scp` command to upload the updated `api.py` to the EC2 instance.
2. Continue with the steps to install dependencies and start the Flask server.
1. **Transfer API Code**:
   - Use `scp` to transfer the `api.py` file to the EC2 instance:
     ```bash
     scp -i <key_pair_name.pem> api.py ec2-user@<public_ip_address_of_the_ec2_instance>:/home/ec2-user
     ```

2. **Run the API**:
   - SSH into the instance and navigate to the directory with `api.py`.
   - Start the API service:
     ```bash
     python3 api.py
     ```
   - Verify the server is running.

#### Part 3: Set Up Chrome Extension
1. **Load the Extension**:
   - Unzip the LinkedIn Job Feedback folder.
   - Go to Chrome > Extensions and enable "Developer mode."
   - Click "Load unpacked" and select the unzipped folder.

2. **Update IP Address**:
   - Open `background.js` in the extension folder.
   - Update the IP address at lines 13 and 28 to the EC2 instance's public IP.

3. **Test the Extension**:
   - Visit LinkedIn's job page to see if the feedback textbox is injected.
   - Verify the API connection and S3 integration based on the project description.

#### Notes:
- Each time the EC2 instance restarts, update its public IP in `background.js` and API connection settings.
- Refer to the documentation for S3 storage and summary display functionality in the extension.
