<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Study Buddy API - A comprehensive platform for connecting students with study buddies, managing study sessions, and providing help through a ticket system.

### Key Features

- **Study Buddy Matching**: Connect learners with experienced students based on skills and availability
- **Session Management**: Book, confirm, and manage study sessions with integrated Google Calendar and Meet
- **Real Google Calendar Integration**: Automatic calendar event creation with Google Meet links
- **Ticket System**: Create and manage help requests with file attachments and comments
- **User Management**: Comprehensive user profiles with skills, availability, and verification
- **Notification System**: In-app notifications for all platform activities
- **Advanced Analytics**: Track session statistics, user performance, and platform usage

### Google Calendar Integration

This application features **real Google Calendar API integration** with:
- Automatic calendar event creation for study sessions
- Google Meet link generation for each session
- Participant email management and invitations
- Event updates when session details change
- Event deletion when sessions are cancelled
- Support for both Service Account and OAuth2 authentication

For setup instructions, see [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)

## API Documentation

### Authentication
All endpoints require JWT authentication except for registration and login.
```
Authorization: Bearer <jwt-token>
```

### Core Modules

#### 1. Study Buddy Module (`/study-buddies`)
- **GET /study-buddies** - Search for available study buddies with skills and availability filters
- **GET /study-buddies/my-profile** - Get current user's buddy profile
- **POST /study-buddies** - Register as a study buddy
- **PATCH /study-buddies/:id** - Update study buddy profile

#### 2. Session Management (`/sessions`)
- **POST /sessions** - Book a new study session (automatically creates Google Calendar event)
- **GET /sessions** - Get all sessions with advanced filtering
- **GET /sessions/my-sessions** - Get current user's sessions
- **GET /sessions/:id** - Get session details
- **PATCH /sessions/:id** - Update session (confirm, cancel, add feedback)
- **DELETE /sessions/:id** - Cancel session (deletes calendar event)
- **POST /sessions/sync-calendar** - Sync calendar events for existing sessions

#### 3. Ticket System (`/tickets`)
- **POST /tickets** - Create a help ticket with attachments
- **GET /tickets** - Get all tickets with filtering
- **GET /tickets/my-tickets** - Get current user's tickets
- **GET /tickets/:id** - Get ticket details
- **PATCH /tickets/:id** - Update ticket or claim ticket
- **POST /tickets/:id/comments** - Add comment to ticket

#### 4. User Management (`/users`)
- **GET /users/profile** - Get current user profile
- **PATCH /users/profile** - Update user profile
- **POST /users/skills** - Add skills to user profile
- **DELETE /users/skills/:skill** - Remove skill from profile
- **GET /users/verification-document** - Get verification document
- **POST /users/verification-document** - Upload verification document

#### 5. Statistics (`/stats`)
- **GET /stats/overview** - Platform overview statistics
- **GET /stats/sessions** - Session-related statistics
- **GET /stats/tickets** - Ticket-related statistics
- **GET /stats/users** - User-related statistics
- **GET /stats/upcoming-sessions** - Upcoming sessions for current user
- **GET /stats/recent-tickets** - Recent tickets for current user

#### 6. Notifications (`/notifications`)
- **GET /notifications** - Get user notifications with pagination
- **PATCH /notifications/:id/read** - Mark notification as read
- **PATCH /notifications/mark-all-read** - Mark all notifications as read
- **DELETE /notifications/:id** - Delete notification

#### 7. Google Calendar Integration (`/google-calendar`)
- **GET /google-calendar/health** - Check Google Calendar API connection
- **GET /google-calendar/upcoming** - Get upcoming calendar events

### Google Calendar Features

When sessions are created, the system automatically:
1. Creates a Google Calendar event with session details
2. Generates a Google Meet link for the session
3. Adds both participants (buddy and learner) to the event
4. Sends calendar invitations to both participants
5. Sets up reminders (24 hours and 15 minutes before)

When sessions are updated:
- Calendar events are automatically updated with new details
- Participants receive updated invitations

When sessions are cancelled:
- Calendar events are automatically deleted
- Participants receive cancellation notifications

### Environment Configuration

The application requires these environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/study_buddy_db"

# JWT
JWT_SECRET="your-jwt-secret"

# Google Calendar API
GOOGLE_CALENDAR_TYPE="service_account"
GOOGLE_CALENDAR_PROJECT_ID="your-project-id"
GOOGLE_CALENDAR_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# ... other Google Calendar credentials

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-west-2"
AWS_S3_BUCKET_NAME="your-bucket"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
```

See `.env.example` for the complete configuration template.

## Database Migration

After setting up the environment variables, run the database migration:

```bash
npx prisma migrate dev --name init
```

This will create all necessary tables including the new calendar event tracking fields.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

# Deploying a NestJS App with Prisma and PostgreSQL to AWS Elastic Beanstalk

In this guide, we will walk through deploying a NestJS application (using Prisma ORM and a PostgreSQL database) to AWS Elastic Beanstalk. We will cover both **manual setup via the AWS Console** and an **Infrastructure-as-Code approach with Terraform**. Key steps include creating the Elastic Beanstalk environment, provisioning an RDS PostgreSQL database, configuring IAM roles and users, setting up CI/CD with GitHub Actions, and handling Prisma-specific deployment considerations. The guide prioritizes clarity, accuracy, security best practices, and automation.

## Prerequisites

- **NestJS Application** with Prisma already set up (including a `schema.prisma` and migrations or seed script if applicable).
- **AWS Account** with appropriate permissions to create the resources.
- For Terraform: **Terraform CLI** installed, and AWS credentials configured for it.
- For CI/CD: A **GitHub repository** for your NestJS app.

## Step 1: Create an Elastic Beanstalk Application and Environment

Elastic Beanstalk (EB) will host our NestJS API. We need to create an **EB Application** (a logical group for environments) and an **Environment** (the actual running instance configuration).

- **Manual (AWS Console):** Go to the Elastic Beanstalk service in the AWS Console and click “Create Application.” 
  1. Select "Web server environment" (since this is an API server) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=In%20the%20first%20creation%20step%2C,our%20API%20will%20be%20running)). Give your application a name and environment name (these cannot be easily changed later) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=In%20the%20first%20creation%20step%2C,our%20API%20will%20be%20running)).
  2. Choose the **Platform** as *Node.js*. Select a platform version (e.g. Node.js 18 running on 64-bit Amazon Linux 2). For this tutorial, Node.js 18 is used as an example ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=First%20Step)).
  3. For application code, you can start with a sample application (you will upload your code later) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Next%2C%20we%20must%20choose%20the,to%20help%20us%20choose%20the)). For environment type, choose **Single instance** for simplicity (or **Load balanced** for production high-availability) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=be%20created%20by%20Elastic%20Beanstalk%2C,Elastic%20Beanstalk%20will%20be%20creating)) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=volume%2C%20and%20also%20set%20up,Elastic%20Beanstalk%20will%20be%20creating)).
  4. In **Configuration**, you'll be prompted to select or create roles (we will create those in a later step) and an EC2 Key Pair for SSH (you can create one in the EC2 console under Key Pairs) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Going%20to%20the%20next%20step%2C,can%20create%20this%20on%20IAM)). Select the EC2 Instance Profile (IAM role) for your instances – if one doesn’t exist yet, you can create it on the fly (see Step 3).
  5. (Optional) In **Networking**, choose a VPC and subnets. If you plan to use an RDS database that is not publicly accessible, ensure your EB instances are in the same VPC and have access to the DB subnets. You can also choose whether the instances get a public IP. For this guide, you might allow a public IP for the EB instance (especially if using a single-instance environment) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=On%20the%20next,public%20and%20choosing%20two%20subnets)).
  6. Review and create the environment. It will take a few minutes to launch. Once ready, EB will provide a **URL** for your environment (e.g. `myapp-env.eba-xyz.us-east-1.elasticbeanstalk.com`) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Accessing%20your%20sample%20Elastic%20Beanstalk,Application)). Initially, it will show a sample Node.js page confirming the environment is up ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=By%20accessing%20it%2C%20you%20are,going%20to%20see%20this%20page)) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Sample%20Page)).

- **Terraform (IaC):** You can codify the above steps in Terraform. For example:
  ```hcl
  resource "aws_elastic_beanstalk_application" "app" {
    name = "my-nestjs-app"
  }

  resource "aws_elastic_beanstalk_environment" "env" {
    name                = "my-nestjs-env"
    application         = aws_elastic_beanstalk_application.app.name
    solution_stack_name = "64bit Amazon Linux 2 v5.7.4 running Node.js 18"  # Example solution stack
    # Or use platform_arn for a specific platform version.

    # Attach the EC2 Instance Profile (created in Step 3)
    setting {
      namespace = "aws:autoscaling:launchconfiguration"
      name      = "IamInstanceProfile"
      value     = aws_iam_instance_profile.eb_ec2_profile.name
    }

    # (Optional) If using a load-balanced environment, you can configure a health check URL:
    setting {
      namespace = "aws:elasticbeanstalk:environment:process:default"
      name      = "HealthCheckPath"
      value     = "/health"
    }

    # (Optional) VPC settings if needed (IDs could come from data sources or variables)
    # setting {
    #   namespace = "aws:ec2:vpc"
    #   name      = "VPCId"
    #   value     = "<vpc-id>"
    # }
    # setting {
    #   namespace = "aws:ec2:vpc"
    #   name      = "Subnets"
    #   value     = "<subnet-id-1>,<subnet-id-2>"
    # }
  }
  ```
  In the above, we specify the platform via `solution_stack_name` (find the exact name for your Node.js version in AWS docs or by running `aws elasticbeanstalk list-available-solution-stacks`). We also attach the instance profile for EC2 (coming from Step 3). The optional `HealthCheckPath` is set to `/health` – this is useful if we implement a custom health check endpoint (see Step 10) so the load balancer knows when the app is healthy. The environment creation will automatically create the necessary AWS resources (EC2 instance, possibly a Load Balancer if in LB mode, etc.) ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Next%2C%20we%20must%20choose%20the,to%20help%20us%20choose%20the)).

**Note:** Elastic Beanstalk expects the application to listen on port **8080** by default. Ensure your NestJS app is configured to use the port from the environment (typically `process.env.PORT`) or explicitly listen on 8080, otherwise health checks will fail ([Deploy your NestJS API on AWS Elastic Beanstalk | by Juan P. Lima | Medium](https://medium.com/@juanpireslima/deploy-your-nestjs-api-on-aws-elastic-beanstalk-884e06e3ac5f#:~:text=Now%20it%E2%80%99s%20time%20to%20deploy,project%20on%20the%20right%20port)). For example, in NestJS you might use:
```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
```
This will handle the EB scenario where `PORT=8080` is set automatically.

## Step 2: Set Up a PostgreSQL Database via Amazon RDS

Your NestJS app needs a PostgreSQL database. We will create an RDS PostgreSQL instance and connect our EB app to it.

- **Manual (AWS Console):** Go to the RDS service and create a new **PostgreSQL** database (Standard Create).
  1. Choose the engine **PostgreSQL** and a suitable version.
  2. For **Credentials**, set a master username and password (save these securely; we'll use them in the app config).
  3. For **Instance size**, choose an instance class (e.g. `db.t3.micro` for testing).
  4. For **Connectivity**, select the same VPC as your Elastic Beanstalk environment. Decide whether to make the DB publicly accessible. **Best practice:** *keep the database **private*** (not publicly accessible) and ensure the EB instance can access it via VPC networking. If private, place the DB in private subnets and the EB instance either in the same private subnets or in public subnets with a routing to the DB subnets.
  5. Configure **Security Groups** such that the EB EC2 instances can talk to the RDS on its port (5432). For example, you might create a security group for the database that allows inbound PostgreSQL (5432) from the security group of the EB instances (or from the VPC CIDR). If using default VPC and default security group for both, this is often handled (default SG allows all inbound from itself).
  6. Finish creating the database and wait for it to be available. Note down the **Endpoint** (host address) and the **Port** (usually 5432).

  Once the DB is ready, you’ll have the details needed to connect: hostname, port, database name, username, and password. Elastic Beanstalk can pass these to your application via environment variables. A common practice with Prisma is to use a single `DATABASE_URL` environment variable. (If you had used EB’s built-in **“Add database”** feature during environment creation, EB would automatically provide `RDS_HOSTNAME`, `RDS_PORT`, `RDS_DB_NAME`, etc. ([Adding a database to your Elastic Beanstalk environment - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html#:~:text=It%20takes%20about%2010%20minutes,through%20the%20following%20environment%20properties)) ([Adding a database to your Elastic Beanstalk environment - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html#:~:text=)), but here we are setting up the database separately for more control.)

- **Terraform (IaC):** You can create the database in your Terraform script as well:
  ```hcl
  resource "aws_db_instance" "db" {
    identifier   = "my-nestjs-db"
    engine       = "postgres"
    engine_version = "14.8"            # for example
    instance_class = "db.t3.micro"
    allocated_storage = 20            # GB
    storage_encrypted = true

    name     = "appdb"                # initial database name
    username = var.db_username
    password = var.db_password

    vpc_security_group_ids = [aws_security_group.db.id]
    publicly_accessible   = false     # best practice: false for a private DB
    skip_final_snapshot   = true      # for tutorial purposes; in production consider snapshots on deletion
  }

  resource "aws_security_group" "db" {
    name   = "allow-pg-from-eb"
    vpc_id = "<vpc-id>"  # your VPC id (or use data source for default VPC)
    ingress {
      protocol  = "tcp"
      from_port = 5432
      to_port   = 5432
      # Source security group of EB instances:
      security_groups = [aws_security_group.eb_instances.id]
    }
    egress {
      protocol = "-1"
      from_port = 0
      to_port   = 0
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  ```
  In the above, we create a PostgreSQL instance and a security group that allows the EB instances to connect (assuming `aws_security_group.eb_instances` is the SG attached to your EB environment's instances). The username and password can be provided via Terraform variables (make sure not to hard-code sensitive credentials; use Terraform `.tfvars` or your CI pipeline to supply them). We keep the DB private (`publicly_accessible = false`) and restrict access via SG rules – a security best practice.

  After creation, the database endpoint is available as `aws_db_instance.db.address`. We will feed this into our EB app’s configuration:
  ```hcl
  # In aws_elastic_beanstalk_environment resource, add:
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.db.address}:${aws_db_instance.db.port}/${aws_db_instance.db.name}"
  }
  ```
  This sets an environment variable `DATABASE_URL` for the EB app with the connection string. Note that for Prisma, you might also want to include additional parameters like `?schema=public` or SSL modes. AWS RDS often enforces SSL; if you encounter SSL trust issues, you can append `?sslmode=require` or `?sslmode=no-verify` to the URL to allow connection without certificate verification ([Caveats when deploying to AWS platforms | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms#:~:text=To%20resolve%20this%20issue%2C%20update,file%20as%20follows)). For example:  
  `postgresql://user:pass@host:5432/db?sslmode=no-verify`

## Step 3: Create an EC2 Instance Profile and IAM Roles for Elastic Beanstalk

Elastic Beanstalk runs your application on EC2 instances. These instances need an **IAM Instance Profile** attached that gives them permissions to do things like download your application from S3 and write logs to CloudWatch or S3. By default, AWS often expects an instance profile named **`aws-elasticbeanstalk-ec2-role`** to exist.

- **Manual (AWS Console):** Go to the IAM service:
  1. Navigate to **Roles** and click "Create Role". Choose **AWS Service** -> **EC2** as the trusted entity (since this role will be assumed by EC2 instances).
  2. Attach policies that allow necessary EB actions. AWS provides managed policies for Elastic Beanstalk EC2 instances: for example, attach **`AWSElasticBeanstalkWebTier`** and **`AWSElasticBeanstalkMulticontainerDocker`** (for Node.js, the WebTier policy is usually sufficient). These policies grant permissions for things like S3 (to fetch application versions) and logging ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=,AWS%20services%20on%20your%20behalf)) ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=,and%20uploading%20logs%20to%20S3)).
  3. Name the role (e.g. `aws-elasticbeanstalk-ec2-role`) and create it. 
  4. **Create Instance Profile:** In IAM, switch to the **Instance Profiles** section (or the "Roles" detail page might show an **Instance profile** tab). If not automatically created with the same name, create a new instance profile and associate the role you just created. (An instance profile is a container for the role that EC2 can use).
  5. Back in the EB environment creation (Step 1), choose this role as the EC2 Instance Profile for your environment. Elastic Beanstalk will now apply this role to all EC2 instances it launches ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=If%20your%20AWS%20account%20doesn%E2%80%99t,steps%20to%20create%20your%20environment)).

  *Why this is needed:* New AWS accounts no longer create the default `aws-elasticbeanstalk-ec2-role` automatically. If it’s missing, EB environment creation will error out. By creating it ourselves, we ensure EB instances can assume the role and have the needed permissions ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=If%20your%20AWS%20account%20doesn%E2%80%99t,steps%20to%20create%20your%20environment)).

- **Terraform (IaC):** We can create the IAM role and instance profile in code:
  ```hcl
  resource "aws_iam_role" "eb_instance_role" {
    name = "aws-elasticbeanstalk-ec2-role"
    assume_role_policy = jsonencode({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {"Service": "ec2.amazonaws.com"},
          "Action": "sts:AssumeRole"
        }
      ]
    })
  }

  resource "aws_iam_role_policy_attachment" "eb_web_tier" {
    role       = aws_iam_role.eb_instance_role.name
    policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
  }
  resource "aws_iam_role_policy_attachment" "eb_logs" {
    role       = aws_iam_role.eb_instance_role.name
    policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  }
  # (Attach any other necessary policies, e.g., S3 read access is included in WebTier. 
  # If your app needs to access other AWS services, attach those permissions here.)

  resource "aws_iam_instance_profile" "eb_ec2_profile" {
    name = aws_iam_role.eb_instance_role.name
    role = aws_iam_role.eb_instance_role.name
  }
  ```
  This creates a role and attaches the AWS-managed Elastic Beanstalk WebTier policy (and we added CloudWatch Logs full access so the app can send logs). The instance profile is created with the same name, which our EB environment (in Step 1 Terraform) refers to. Now, when EB launches EC2 instances, they will have this IAM role, allowing them to retrieve application versions from S3 and perform other EB-managed actions ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=,and%20uploading%20logs%20to%20S3)).

## Step 4: Create an IAM User for CI/CD (GitHub Actions)

To automate deployments from GitHub, we'll create an IAM user that our GitHub Actions workflow can use. This user will have permissions to deploy to Elastic Beanstalk (and upload application files to the EB S3 bucket).

- **Manual (AWS Console):** In IAM, go to **Users** and click "Add User". 
  - Give it a name like `github-actions-deployer` and **Programmatic access** (so it will have an access key and secret).
  - Attach a policy for Elastic Beanstalk deployment. For simplicity, you can use the AWS managed policy **`AWSElasticBeanstalkFullAccess`** (which allows full control of EB) ([Elastic Beanstalk Service roles, instance profiles, and user policies - AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles.html#:~:text=You%20can%20optionally%20create%20user,Managing%20Elastic%20Beanstalk%20user%20policies)). However, for better security, consider a custom policy that only allows the necessary actions on your specific application. The minimal needed actions include:
    - `elasticbeanstalk:CreateApplicationVersion`
    - `elasticbeanstalk:UpdateEnvironment`
    - `elasticbeanstalk:DescribeEnvironments` (to check status)
    - S3 permissions to upload the application bundle to the EB storage bucket (e.g. `s3:PutObject` on the bucket named like `elasticbeanstalk-<region>-<acct-id>/*`).
  - Attach the policy and create the user. **Save the Access Key ID and Secret Access Key** for this user (you'll need these in GitHub). Download the credentials CSV or copy them from the console – once you navigate away, you won't see the secret again.

- **Terraform (IaC):** Define the user and its permissions:
  ```hcl
  resource "aws_iam_user" "deploy_user" {
    name = "github-actions-deployer"
  }
  resource "aws_iam_user_policy" "deploy_policy" {
    user = aws_iam_user.deploy_user.name
    policy = jsonencode({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "elasticbeanstalk:CreateApplicationVersion",
            "elasticbeanstalk:UpdateEnvironment",
            "elasticbeanstalk:DescribeEnvironments"
          ],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "s3:PutObject",
            "s3:GetObject",
            "s3:ListBucket"
          ],
          "Resource": [
            "arn:aws:s3:::elasticbeanstalk-*",         # EB buckets
            "arn:aws:s3:::elasticbeanstalk-*/*"
          ]
        }
      ]
    })
  }
  resource "aws_iam_access_key" "deploy_user_key" {
    user = aws_iam_user.deploy_user.name
  }
  output "cicd_access_key_id" {
    value = aws_iam_access_key.deploy_user_key.id
    sensitive = true
  }
  output "cicd_secret_access_key" {
    value = aws_iam_access_key.deploy_user_key.secret
    sensitive = true
  }
  ```
  This creates the user and an inline policy. The policy here is broad (allows deploying to any EB application and using any EB S3 bucket). You can restrict `"Resource"` to your specific application ARN and S3 bucket for tighter security. The `aws_iam_access_key` resource will generate the access key and secret for the user; Terraform can output them (marked sensitive). **Important:** Protect these credentials; treat them like passwords. In a real setup, you might use GitHub OIDC federation to assume a role instead of static credentials, but using an access key is simpler for a basic CI/CD.

## Step 5: Link the GitHub Repository to the Deployment Process

Now that we have an IAM user for deployment, we need to connect our GitHub repository to AWS using those credentials so that GitHub Actions can deploy. This isn’t so much an AWS Console step as it is setting up secrets in GitHub and preparing our code for deployment.

- **Manual (GitHub setup):** In your GitHub repository, go to **Settings > Secrets and variables > Actions** (or **Settings > Secrets** in older versions). Create the following **Repository Secrets**:
  - `AWS_ACCESS_KEY_ID` – set this to the Access Key ID from the IAM user (from Step 4).
  - `AWS_SECRET_ACCESS_KEY` – the Secret Access Key from Step 4.
  - `AWS_REGION` – the AWS region you are deploying to (e.g. `us-east-1`).
  - (Optionally) `EB_APPLICATION` and `EB_ENVIRONMENT` – the names of your Elastic Beanstalk Application and Environment. This can help keep your GitHub Actions workflow generic. For example, `EB_APPLICATION = my-nestjs-app` and `EB_ENVIRONMENT = my-nestjs-env` (the ones you chose in Step 1).

  By storing these in GitHub Secrets, we ensure the sensitive values (keys, etc.) are not exposed in code. GitHub Actions will be able to reference them securely.

- **Alternative (AWS CodePipeline):** As an aside, AWS offers CodePipeline/CodeBuild to link to GitHub and deploy to EB. While that is an option, here we focus on GitHub Actions for CI/CD. If you prefer the AWS Console route, you would create a CodePipeline with a GitHub source and an Elastic Beanstalk deploy action. That approach is more involved to set up and beyond this guide's scope since the question specifically mentions GitHub Actions.

## Step 6: Set Up GitHub Actions CI/CD Pipeline for Automatic Deployment

With AWS credentials in place, we can configure GitHub Actions to automatically build and deploy our NestJS app to Elastic Beanstalk on each push (e.g., to the main branch). We'll create a workflow YAML file (e.g., `.github/workflows/deploy.yml`) in the repository.

**GitHub Actions Workflow Example:**

```yaml
name: Deploy to Elastic Beanstalk

on:
  push:
    branches: [ "main" ]  # or your chosen branch for deployments

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build  # Assumes your NestJS has a build script to compile TypeScript

      - name: Generate Prisma Client
        run: npx prisma generate  # Ensure the Prisma client is generated (especially if you plan to include it in the bundle)

      - name: Zip deployment package
        run: zip -r deploy.zip . -x \"*.git*\" \"node_modules/*\"
        # Excluding .git and node_modules to reduce package size; EB will install deps

      - name: Deploy to Elastic Beanstalk
        uses: einaregilsson/beanstalk-deploy@v22
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          region: ${{ secrets.AWS_REGION }}
          application_name: ${{ secrets.EB_APPLICATION }}
          environment_name: ${{ secrets.EB_ENVIRONMENT }}
          version_label: ${{ github.run_number }}-${{ github.sha }}
          deployment_package: deploy.zip
```

Let’s break down what this does:

- We trigger on pushes to the main branch.
- The job runs on the latest Ubuntu runner.
- We checkout the code and set up Node.js 18.
- Install dependencies using `npm ci` (which uses `package-lock.json` to ensure consistent installs).
- Build the NestJS project (compile TypeScript to JavaScript).
- Run Prisma generate to ensure the Prisma Client is up-to-date (especially important if you've changed the schema).
- Zip the application code into `deploy.zip`. We exclude the `.git` folder and `node_modules`. We will let EB handle installing dependencies on the EC2 instance (this keeps the bundle small and avoids OS-specific binaries issues).
- Use the **Beanstalk Deploy** GitHub Action by Einar Egilsson to handle the deployment. This action will upload the zip to S3, create a new EB Application Version, and update the environment to the new version ([Beanstalk Deploy · Actions · GitHub Marketplace · GitHub](https://github.com/marketplace/actions/beanstalk-deploy#:~:text=Beanstalk%20Deploy%20is%20a%20GitHub,handle%20rolling%20back%20the%20environment)) ([Beanstalk Deploy · Actions · GitHub Marketplace · GitHub](https://github.com/marketplace/actions/beanstalk-deploy#:~:text=The%20action%20expects%20you%20to,Example)). We pass the required inputs: AWS credentials, region, EB app name, EB environment name, a version label (here we use a combination of the GitHub run number and commit SHA for uniqueness), and the file to deploy ([Beanstalk Deploy · Actions · GitHub Marketplace · GitHub](https://github.com/marketplace/actions/beanstalk-deploy#:~:text=,x%20%27%2A.git)).

After adding this workflow, commit it to your repository. On the next push, GitHub Actions will run and, if everything is configured correctly, your NestJS app will be built and deployed to Elastic Beanstalk automatically.

**Notes:**
- Make sure the `application_name` and `environment_name` in the workflow match exactly what you created in EB (they are case-sensitive).
- The first deployment might take a few minutes as EB provisions resources or updates configuration.
- You can monitor the deployment in the AWS Console under Elastic Beanstalk > your environment > “Events” to see logs from the deployment (the GitHub Action will also wait and show logs, failing if the deployment fails) ([Beanstalk Deploy · Actions · GitHub Marketplace · GitHub](https://github.com/marketplace/actions/beanstalk-deploy#:~:text=AWS%20Elastic%20Beanstalk,handle%20rolling%20back%20the%20environment)) ([Beanstalk Deploy · Actions · GitHub Marketplace · GitHub](https://github.com/marketplace/actions/beanstalk-deploy#:~:text=version%20in%20Elastic%20Beanstalk%2C%20and,handle%20rolling%20back%20the%20environment)).

## Step 7: Configure Elastic Beanstalk Environment Variables (e.g. DATABASE_URL)

Your application likely needs certain environment variables in production – most importantly the database connection string. We set this in Terraform earlier, but if you are using the AWS Console for configuration:

- **Manual (AWS Console):** Open your Elastic Beanstalk environment in the console, go to **Configuration**, and edit the **Software** settings (or look for an “Environment properties” section). Add the necessary variables, for example:
  - `DATABASE_URL` – e.g. `postgresql://username:password@your-db-endpoint:5432/appdb` (the connection string to your RDS database).
  - Any other secrets or config (if any) your NestJS app needs (like API keys, etc.). Avoid hard-coding secrets in your code; use environment variables here instead.
  - Optionally, set `NODE_ENV = production` for Node best practices.
  - **Prisma-specific:** If you did not move the `prisma` CLI to dependencies, you may need to set `NPM_USE_PRODUCTION = false` here. This tells EB to install devDependencies as well (ensuring the Prisma CLI is present to run generate or migrations) ([Caveats when deploying to AWS platforms | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms#:~:text=1.%20Add%20the%20,environment)). Another way is to include the Prisma CLI as a dependency instead of devDependency ([Caveats when deploying to AWS platforms | Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms#:~:text=This%20error%20happens%20because%20AWS,remedy%20this%20you%20can%20either)) (so it gets installed even with production install). We will address this in the next step.

  Apply the changes. EB will apply these env vars to the instances (triggering a configuration update). Your NestJS app can now read `process.env.DATABASE_URL` to connect to the database.

- **Terraform (IaC):** As shown earlier, environment variables can be set in the `aws_elastic_beanstalk_environment` resource via multiple `setting { namespace = "aws:elasticbeanstalk:application:environment", ... }` blocks. Each such setting corresponds to one env var. In our Terraform snippet, we already included `DATABASE_URL`. You could also include others like:
  ```hcl
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name  = "NODE_ENV"
    value = "production"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name  = "NPM_USE_PRODUCTION"
    value = "false"
  }
  ```
  The above would install devDependencies on EB (if needed for Prisma CLI). You should still include the `.npmrc` `unsafe-perm` setting.

## Troubleshooting Common Issues

1. **Application not starting**: Check the logs in Elastic Beanstalk > Logs. Common issues:
   - Port configuration: Ensure your app listens on the port provided by Elastic Beanstalk (usually via `process.env.PORT`).
   - Environment variables: Make sure all required env vars are set in the EB console or via Terraform.
   - Database connection: Verify the `DATABASE_URL` is correct and the database is accessible from the EB instance.

2. **Prisma issues**: If you encounter errors related to Prisma:
   - Ensure the Prisma Client is generated: `npx prisma generate` (this should be part of your build or deploy script).
   - Check database migrations: Ensure the database schema is up-to-date with your Prisma schema.

3. **Google Calendar integration not working**: If the Google Calendar features are not functioning:
   - Verify the Google Calendar API credentials are correct and have the necessary permissions.
   - Check the application logs for any errors related to Google Calendar API calls.

4. **File uploads to S3 failing**: If your application uses AWS S3 for file uploads and it's failing:
   - Ensure the S3 bucket exists and the name is correct in your environment variables.
   - Check the IAM role permissions: The role attached to your EB instances should have permissions to access the S3 bucket.

5. **CORS issues**: If your frontend cannot access the API:
   - Ensure CORS is configured in your NestJS application to allow requests from your frontend's origin.

6. **Health check failures**: If Elastic Beanstalk reports the environment as unhealthy:
   - Check the health check URL (default is `/health`). Ensure your application responds to this path.
   - Review the application and server logs for any errors.

For any persistent issues, consult the AWS Elastic Beanstalk documentation or seek help from the community forums with specific error messages and logs.
