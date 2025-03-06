# security-infra/main.tf
module "zero_trust_network" {
  source = "git::https://github.com/secure-by-design/ztna-aws"

  threat_hunting_enabled  = true
  ml_inference_endpoints  = 3
  auto_containment_zones  = ["analysis", "quarantine"]
  cross_region_replication = true
}

resource "k8s_custom_resource" "security_policy" {
  api_version = "security.enterprise/v1alpha2"
  kind        = "AdaptiveSecurityPolicy"

  metadata {
    name = "real-time-protection"
  }

  spec {
    auto_scaling = {
      min_replicas = 3
      max_replicas = 100
      metrics = [
        {
          type = "PacketProcessingRate"
          target = {
            average_value = "10k/s"
          }
        }
      ]
    }

    threat_model = {
      kill_chain_phase   = ["Reconnaissance", "LateralMovement"]
      ttp_coverage       = 0.92
      adversarial_resistance = "high"
    }
  }
}