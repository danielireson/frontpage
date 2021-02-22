# frontpage.today

```
# create s3 bucket to hold deployments
aws s3api create-bucket \
  --bucket frontpage-today-deployments \
  --region us-east-1 \
  --acl private

# create parameters config file
cp config/exmaple.json config/prod.json

# invoke locally
npm run build

# package stack
aws cloudformation package \
  --template template.yml \
  --output-template-file deploy-template.yml \
  --s3-bucket frontpage-today-deployments

# create stack
aws --region us-east-1 cloudformation create-stack \
  --stack-name frontpage-today-prod \
  --template-body file://deploy-template.yml \
  --parameters file://config/prod.json \
  --capabilities CAPABILITY_IAM \
  --timeout-in-minutes 10

# update stack
aws --region us-east-1 cloudformation deploy \
  --stack-name frontpage-today-prod \
  --template-file deploy-template.yml \
  --capabilities CAPABILITY_IAM

```
