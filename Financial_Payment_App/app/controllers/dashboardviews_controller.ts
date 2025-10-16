import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardviewsController {
  async index({ view }: HttpContext) {
    return view.render('pages/dashboard')
  }
}
