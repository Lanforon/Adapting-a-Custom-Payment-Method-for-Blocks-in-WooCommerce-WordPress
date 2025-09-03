	################################# Добавьте этот код в инициализацию wp ####################################


	// Хук, который вызывается, когда WooCommerce Blocks загружены
	add_action( 'woocommerce_blocks_loaded', 
	function() {

		// Проверяем, существует ли класс PaymentMethod из WooCommerce Blocks
		if ( ! class_exists( 'Automattic\WooCommerce\Blocks\Payments\PaymentMethod' ) ) {
			// Если класс не найден, пишем ошибку в лог и прерываем выполнение
			return;
		}

		// Регистрируем новый тип метода оплаты для WooCommerce Blocks
		add_filter('woocommerce_blocks_payment_method_type_registration', function( $payment_method_types ) {
			// Добавляем ключ 'proxystripe' с параметрами:
			$payment_method_types['proxystripe'] = [
				'className' => 'ProxyStripePaymentMethod',  // Имя JS-класса, который реализует UI оплаты на фронтенде
				'supports'  => [ 'products', 'subscriptions' ], // Определяем, что метод оплаты поддерживает товары и подписки
			];
			return $payment_method_types;  // Возвращаем расширенный список методов оплаты
		});

    	// Определяем PHP-класс для нашего метода оплаты на стороне WooCommerce Blocks
		class ProxyStripe_Block_PaymentMethod extends Automattic\WooCommerce\Blocks\Payments\PaymentMethod {
			public function __construct() {
				// Вызываем конструктор родительского класса, передавая ID метода и поддерживаемые типы
				parent::__construct(
					'proxystripe',  // ID метода оплаты (должен совпадать с ключом выше)
					[
						'supports' => [ 'products', 'subscriptions' ], // Поддержка продуктов и подписок
					]
				);
			}

			// Здесь можно добавить методы для обработки платежей, если нужно
		}

		// Регистрируем наш метод оплаты в системе WooCommerce Blocks
		add_action('woocommerce_blocks_payment_method_registration', function($payment_methods) {
			$payment_methods->register('proxystripe', new ProxyStripe_Block_PaymentMethod());
		});

	});

	// Функция подключения JS-скрипта с UI нашего метода оплаты
	function proxystripe_enqueue_block_scripts() {
		wp_register_script(
			'proxystripe-blocks',  // Уникальный хендл скрипта
			plugin_dir_url( __FILE__ ) . 'assets/js/payment-method.js', 
			array( 'wp-element', 'wc-blocks-checkout' ), // Зависимости: React из WP и скрипты WooCommerce Blocks
			'1.0',  // Версия скрипта
			true    // Загружать в футере страницы
		);
		wp_enqueue_script( 'proxystripe-blocks' );  // Включаем скрипт для загрузки
	}
	// Подключаем скрипт в блоках WooCommerce
	add_action('enqueue_block_assets', 'proxystripe_enqueue_block_scripts');

