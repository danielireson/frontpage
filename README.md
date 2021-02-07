# frontpage.today

```
# create s3 bucket to hold deployments
aws s3api create-bucket \
  --bucket frontpage-today-deployments \
  --region us-east-1 \
  --acl private

# create parameters config file
cp aws/parameters/exmaple.json aws/parameters/prod.json

# create stack
aws cloudformation create-stack \
  --stack-name frontpage-today-prod \
  --stack-region us-east-1 \
  --template-body file://aws/stack.yml \
  --parameters file://aws/parameters/prod.json \
  --timeout-in-minutes 10

```
