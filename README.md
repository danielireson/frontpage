# Frontpage

Daily news aggregator built on AWS.

## Motivation

Today's media landscape can be polarizing and it's far too easy to consume content that's biased towards one particular viewpoint. I wanted to explore an idea of aggregating news but hiding sources, therefore exposing users to a wider variety of publications and encouraging readership based on topic of interest rather than political bias.

## Technology

The [CloudFormation template](/template.yml) describes the stack. The website is distributed as a static site on S3 with CloudFront. An AWS Lambda function builds the site by reading regional RSS feeds and compiling a handlebars template. When users visit the CloudFront distribution, a Lambda@Edge function redirects users to the most appopriate regional edition. This redirect happens by rewriting the request to the relevant HTML template on S3 (e.g. IE.html for Irish visitors).

## Development

```shell
# build locally
./scripts/build
```

This builds regional templates locally at `/functions/build/dist/` but does not sync with S3.

## Production

```shell
# create config file
cp config/exmaple.json config/prod.json

# create stack
./scripts/create-stack prod

# update stack
./scripts/update-stack prod
```

A Hosted Zone and SSL/TLS Certificate from AWS Certificate Manager will need to be manually set up. These need to be defined in the config file as `HostedZone` and `CertificateARN` prior to deploying the stack.

## License

This project is licensed under the MIT License.
