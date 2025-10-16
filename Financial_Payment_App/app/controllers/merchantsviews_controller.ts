import type { HttpContext } from '@adonisjs/core/http'

export default class MerchantsviewsController {
  async index({ view }: HttpContext) {
    return view.render('pages/merchant')
  }
}
