import { Eye, FileText, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

const posts = [
  { id: 1, title: 'Как выбрать тему для Telegram-канала',    preview: 'Правильно выбранная тема — фундамент успешного канала. Разбираем 7 критериев, которые помогут не ошибиться на старте.',                        status: 'published', date: '20 июн 2025', views: 4210 },
  { id: 2, title: 'Топ-5 ошибок при ведении канала',          preview: 'Большинство авторов совершают одни и те же ошибки в первые месяцы. Мы собрали самые частые и объяснили, как их избежать.',                        status: 'published', date: '18 июн 2025', views: 3850 },
  { id: 3, title: 'Анонс нового формата контента',            preview: 'Запускаем серию материалов о структуре постов, удержании аудитории и регулярном графике публикаций без выгорания.',                                status: 'scheduled', date: '22 июн 2025', views: null },
  { id: 4, title: 'Как увеличить охват без рекламы',          preview: 'Органический рост возможен даже без бюджета. Рассказываем о перекрёстных упоминаниях, SEO для Telegram и виральном контенте.',                     status: 'draft',     date: '—',           views: null },
  { id: 5, title: 'Кейс: рост с нуля до 10 000 подписчиков', preview: 'Полная история канала за 6 месяцев: что публиковали, какие форматы зашли, как менялась аудитория и какие ошибки стоили нам подписчиков.',           status: 'published', date: '14 июн 2025', views: 6120 },
  { id: 6, title: 'Инструменты для работы с контентом',       preview: 'Обзор сервисов, которыми пользуются опытные авторы: от планирования и аналитики до генерации идей и автоматической публикации.',                   status: 'failed',    date: '12 июн 2025', views: null },
  { id: 7, title: 'Итоги месяца: что сработало',              preview: 'Анализируем результаты за июнь: лучшие посты по охвату, форматы с высокой вовлечённостью и выводы для следующего месяца.',                          status: 'draft',     date: '—',           views: null },
]

const statuses = {
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl text-muted-foreground gap-2">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm">Посты не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((post) => {
            const s = statuses[post.status as keyof typeof statuses]
            const StatusIcon = s.icon
            return (
              <article
                key={post.id}
                className="group bg-card border border-border rounded-xl flex flex-col overflow-hidden hover:shadow-sm hover:border-border/80 transition-all duration-150"
              >
                {/* Card top accent stripe keyed to status */}
                <div
                  className="h-[3px] w-full shrink-0"
                  style={{
                    background:
                      post.status === 'published' ? 'oklch(0.420 0.095 200)' :
                      post.status === 'scheduled' ? 'oklch(0.55 0.14 240)' :
                      post.status === 'failed'    ? 'oklch(0.54 0.21 25)'   :
                      'oklch(0.82 0 0)',
                  }}
                />

                {/* Body */}
                <div className="flex flex-col flex-1 px-5 pt-4 pb-4 gap-3">
                  {/* Status badge */}
                  <span className={`self-start inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                    <StatusIcon size={10} />
                    {s.label}
                  </span>

                  {/* Title */}
                  <h3 className="text-[14px] font-semibold leading-snug line-clamp-2 text-foreground">
                    {post.title}
                  </h3>

                  {/* Preview */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {post.preview}
                  </p>

                  {/* Footer row */}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">{post.date}</span>
                      {post.views !== null && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Eye size={11} />
                          {post.views.toLocaleString('ru')}
                        </span>
                      )}
                    </div>

                    {/* Quick actions — visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Редактировать">
                        <Pencil size={13} />
                      </button>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors" title="Удалить">
                        <Trash2 size={13} />
                      </button>
                      <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Ещё">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Count footer */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} из {posts.length} постов
      </p>
    </div>
  )
}