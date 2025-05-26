# GitHub Actions Workflows

## Pulumi Infrastructure Deployment

The `pulumi-deploy.yml` workflow automates the deployment of infrastructure resources defined in the Pulumi code.

### Workflow Triggers

- **Push to main branch**: Automatically runs when changes are pushed to the `main` branch that affect files in the `iac/` directory.
- **Manual trigger**: Can be manually triggered from the GitHub Actions UI using the "workflow_dispatch" event.

### Required Secrets

The following secrets need to be configured in your GitHub repository settings:

1. **`PULUMI_ACCESS_TOKEN`**: Your Pulumi access token for authenticating with the Pulumi service.

2. **Azure Credentials**:
   - `ARM_CLIENT_ID`: Azure Service Principal Client ID
   - `ARM_CLIENT_SECRET`: Azure Service Principal Client Secret
   - `ARM_TENANT_ID`: Azure Tenant ID
   - `ARM_SUBSCRIPTION_ID`: Azure Subscription ID

### Workflow Steps

1. Checkout the repository code
2. Set up Node.js environment
3. Install dependencies
4. Set up Pulumi CLI
5. Select the Pulumi stack (dev)
6. Preview infrastructure changes
7. Deploy infrastructure changes (only on main branch)

### Setting Up Azure Service Principal

To create an Azure Service Principal for GitHub Actions:

```bash
az ad sp create-for-rbac --name "GitHubActionsPulumi" --role Contributor \
                         --scopes /subscriptions/{subscription-id} \
                         --sdk-auth
```

Add the resulting JSON output as secrets in your GitHub repository.
