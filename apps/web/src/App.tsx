import React from 'react'
import './index.css'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Employee Dashboard POC</h1>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Phase 3 Ready!</CardTitle>
            <CardDescription>Beautiful shadcn + Tailwind setup complete. Ready for layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Test Button</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
