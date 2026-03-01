import { LiveResource } from "../types/index.js";

/**
 * Mock Azure resource fetcher.
 * In production, this will use Azure SDK clients (@azure/arm-storage, etc.)
 * to pull live resource configurations. For now, returns simulated live state
 * that intentionally drifts from the baseline on some fields.
 */
export async function fetchLiveResources(): Promise<LiveResource[]> {
  // Simulated live configs — some fields intentionally drift from baseline
  return [
    {
      type: "azurerm_storage_account",
      name: "gxp_data_lake",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Storage/storageAccounts/stpharmagxpprod001",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "stpharmagxpprod001",
        resource_group_name: "rg-pharma-gxp-prod",
        location: "eastus2",
        account_tier: "Standard",
        account_replication_type: "GRS",
        min_tls_version: "TLS1_2",
        enable_https_traffic_only: true,
        allow_nested_items_to_be_public: false,
        // DRIFT: public access was enabled
        public_network_access_enabled: true,
        shared_access_key_enabled: false,
        infrastructure_encryption_enabled: true,
        encryption: {
          services: {
            blob: { enabled: true, key_type: "Account" },
            file: { enabled: true, key_type: "Account" },
            table: { enabled: true, key_type: "Account" },
            queue: { enabled: true, key_type: "Account" },
          },
          key_source: "Microsoft.Keyvault",
          key_vault_key_id:
            "https://kv-pharma-gxp-prod.vault.azure.net/keys/storage-cmk/v1",
        },
        network_rules: {
          default_action: "Deny",
          bypass: ["AzureServices"],
          ip_rules: [],
          virtual_network_subnet_ids: [
            "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Network/virtualNetworks/vnet-gxp-prod/subnets/snet-data",
          ],
        },
        tags: {
          environment: "production",
          gxp_validated: "true",
          data_classification: "GxP-regulated",
          validation_id: "VLD-2024-0847",
          owner: "data-engineering",
          cost_center: "CC-4200-PHARMA",
        },
      },
    },
    {
      type: "azurerm_key_vault",
      name: "gxp_secrets",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.KeyVault/vaults/kv-pharma-gxp-prod",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "kv-pharma-gxp-prod",
        resource_group_name: "rg-pharma-gxp-prod",
        location: "eastus2",
        sku_name: "premium",
        tenant_id: "55555555-6666-7777-8888-999999999999",
        enabled_for_deployment: false,
        enabled_for_disk_encryption: false,
        enabled_for_template_deployment: false,
        enable_rbac_authorization: true,
        soft_delete_retention_days: 90,
        // DRIFT: purge protection was disabled
        purge_protection_enabled: false,
        public_network_access_enabled: false,
        network_acls: {
          default_action: "Deny",
          bypass: "AzureServices",
          ip_rules: [],
          virtual_network_subnet_ids: [
            "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Network/virtualNetworks/vnet-gxp-prod/subnets/snet-app",
          ],
        },
        tags: {
          environment: "production",
          gxp_validated: "true",
          data_classification: "GxP-regulated",
          validation_id: "VLD-2024-0848",
          owner: "security-team",
          cost_center: "CC-4200-PHARMA",
        },
      },
    },
    {
      type: "azurerm_network_security_group",
      name: "gxp_data_tier",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Network/networkSecurityGroups/nsg-gxp-data-prod",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "nsg-gxp-data-prod",
        resource_group_name: "rg-pharma-gxp-prod",
        location: "eastus2",
        security_rule: [
          {
            name: "AllowVNetInbound",
            priority: 100,
            direction: "Inbound",
            access: "Allow",
            protocol: "Tcp",
            source_port_range: "*",
            destination_port_ranges: ["443", "1433"],
            source_address_prefix: "VirtualNetwork",
            destination_address_prefix: "VirtualNetwork",
          },
          {
            name: "AllowAzureLoadBalancer",
            priority: 200,
            direction: "Inbound",
            access: "Allow",
            protocol: "*",
            source_port_range: "*",
            destination_port_range: "*",
            source_address_prefix: "AzureLoadBalancer",
            destination_address_prefix: "*",
          },
          // DRIFT: new rule allowing SSH from internet was added
          {
            name: "AllowSSHFromInternet",
            priority: 300,
            direction: "Inbound",
            access: "Allow",
            protocol: "Tcp",
            source_port_range: "*",
            destination_port_ranges: ["22"],
            source_address_prefix: "Internet",
            destination_address_prefix: "*",
          },
          {
            name: "DenyAllInbound",
            priority: 4096,
            direction: "Inbound",
            access: "Deny",
            protocol: "*",
            source_port_range: "*",
            destination_port_range: "*",
            source_address_prefix: "*",
            destination_address_prefix: "*",
          },
          {
            name: "AllowVNetOutbound",
            priority: 100,
            direction: "Outbound",
            access: "Allow",
            protocol: "Tcp",
            source_port_range: "*",
            destination_port_ranges: ["443"],
            source_address_prefix: "VirtualNetwork",
            destination_address_prefix: "VirtualNetwork",
          },
          {
            name: "AllowAzureMonitorOutbound",
            priority: 200,
            direction: "Outbound",
            access: "Allow",
            protocol: "Tcp",
            source_port_range: "*",
            destination_port_ranges: ["443"],
            source_address_prefix: "*",
            destination_address_prefix: "AzureMonitor",
          },
          {
            name: "DenyInternetOutbound",
            priority: 4096,
            direction: "Outbound",
            access: "Deny",
            protocol: "*",
            source_port_range: "*",
            destination_port_range: "*",
            source_address_prefix: "*",
            destination_address_prefix: "Internet",
          },
        ],
        tags: {
          environment: "production",
          gxp_validated: "true",
          data_classification: "GxP-regulated",
          validation_id: "VLD-2024-0849",
          owner: "network-team",
          cost_center: "CC-4200-PHARMA",
        },
      },
    },
    {
      type: "azurerm_mssql_database",
      name: "gxp_clinical_data",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Sql/servers/sql-pharma-gxp-prod/databases/sqldb-clinical-trial-data",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "sqldb-clinical-trial-data",
        server_id:
          "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Sql/servers/sql-pharma-gxp-prod",
        collation: "SQL_Latin1_General_CP1_CI_AS",
        max_size_gb: 500,
        sku_name: "BC_Gen5_8",
        zone_redundant: true,
        geo_backup_enabled: true,
        transparent_data_encryption_enabled: true,
        transparent_data_encryption_key_type: "ServiceManaged",
        ledger_enabled: true,
        long_term_retention_policy: {
          weekly_retention: "P4W",
          monthly_retention: "P12M",
          yearly_retention: "P7Y",
          week_of_year: 1,
        },
        short_term_retention_policy: {
          retention_days: 35,
          backup_interval_in_hours: 12,
        },
        // DRIFT: threat detection was disabled
        threat_detection_policy: {
          state: "Disabled",
          email_addresses: ["gxp-security@pharma-corp.com"],
          email_account_admins: "Enabled",
          retention_days: 365,
        },
        auditing_policy: {
          state: "Enabled",
          storage_endpoint:
            "https://stpharmagxpprod001.blob.core.windows.net",
          retention_in_days: 365,
          log_monitoring_enabled: true,
        },
        tags: {
          environment: "production",
          gxp_validated: "true",
          data_classification: "GxP-regulated",
          contains_phi: "true",
          validation_id: "VLD-2024-0850",
          owner: "clinical-data-team",
          cost_center: "CC-4200-PHARMA",
        },
      },
    },
    {
      type: "azurerm_role_assignment",
      name: "validation_system_reader",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/providers/Microsoft.Authorization/roleAssignments/ra-validation-sys-001",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "ra-validation-sys-001",
        scope:
          "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod",
        role_definition_name: "Reader",
        principal_id: "11111111-2222-3333-4444-555555555555",
        principal_type: "ServicePrincipal",
        description:
          "Validation system — read-only access to GxP prod resources for compliance monitoring",
      },
    },
    {
      type: "azurerm_role_assignment",
      name: "data_engineer_contributor",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/providers/Microsoft.Authorization/roleAssignments/ra-data-eng-001",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "ra-data-eng-001",
        scope:
          "/subscriptions/00000000-1111-2222-3333-444444444444/resourceGroups/rg-pharma-gxp-prod/providers/Microsoft.Storage/storageAccounts/stpharmagxpprod001",
        // DRIFT: role was escalated from Blob Data Contributor to Owner
        role_definition_name: "Owner",
        principal_id: "66666666-7777-8888-9999-aaaaaaaaaaaa",
        principal_type: "Group",
        description:
          "Data engineering team — blob data contributor scoped to GxP storage account only",
      },
    },
    {
      type: "azurerm_role_assignment",
      name: "gxp_auditor_readonly",
      id: "/subscriptions/00000000-1111-2222-3333-444444444444/providers/Microsoft.Authorization/roleAssignments/ra-auditor-001",
      fetchedAt: new Date().toISOString(),
      attributes: {
        name: "ra-auditor-001",
        scope: "/subscriptions/00000000-1111-2222-3333-444444444444",
        role_definition_name: "Security Reader",
        principal_id: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
        principal_type: "Group",
        description:
          "GxP auditors — subscription-wide security reader for compliance audits",
      },
    },
  ];
}
