import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react'

export function RiskVisualization({ riskLabel, riskScore }) {
  const getProgressVariant = (label) => {
    switch (label) {
      case 'LOW': return 'success'
      case 'MEDIUM': return 'warning'
      case 'HIGH': return 'danger'
      default: return 'default'
    }
  }

  const getRiskIcon = (label) => {
    switch (label) {
      case 'LOW': return <Shield className="h-5 w-5 text-emerald-600" />
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'HIGH': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Shield className="h-5 w-5 text-slate-600" />
    }
  }

  const formatRiskScore = (score) => {
    return `${score.toFixed(1)}/10`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getRiskIcon(riskLabel)}
          <h3 className="text-xl font-semibold text-slate-900">Risk Assessment</h3>
        </div>
        <Badge variant={riskLabel} className="text-sm font-semibold">
          {riskLabel} RISK
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Risk Score</span>
          <span className="text-2xl font-bold text-slate-900">{formatRiskScore(riskScore)}</span>
        </div>
        <Progress 
          value={riskScore} 
          max={10} 
          variant={getProgressVariant(riskLabel)}
          className="h-4"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Low Risk</span>
          <span>Medium Risk</span>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  )
}