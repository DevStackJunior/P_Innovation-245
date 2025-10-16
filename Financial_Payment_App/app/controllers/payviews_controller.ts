import type { HttpContext } from '@adonisjs/core/http'

export default class PayviewsController {
  async index({ view }: HttpContext) {
    return view.render('pages/pay')
  }
}
