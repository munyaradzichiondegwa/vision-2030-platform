class AugmentedSOCInterface {
  displayCognitiveOverlay(analyst: User, incident: SecurityEvent) {
    return {
      threatVisualization: this.renderAttackGraph(incident),
      decisionSupport: this.generateResponseOptions(
        incident,
        analyst.expertise
      ),
      knowledgeAugmentation: this.retrieveRelevantTTPs(
        incident.indicators
      )
    };
  }
}