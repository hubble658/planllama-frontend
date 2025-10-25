# PlanLLaMA Frontend

PlanLLaMA Frontend - Basit Görev ve Proje Yönetimi

Bu proje, görevleri ve projeleri yönetmeyi amaçlayana, LLM destekli PlanLLaMA uygulamasının frontend kısmıdır.

## Başlarken

Projeyi yerel makinenizde kurmak ve çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

*   Node.js (v18 veya üstü)
*   npm

### Kurulum

1.  Depoyu klonlayın:
    ```sh
    git clone <repo-adresi>
    ```
2.  Proje dizinine gidin:
    ```sh
    cd planllama-frontend
    ```
3.  Gerekli paketleri yükleyin:
    ```sh
    npm install
    ```

### Çalıştırma

Geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:

```sh
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

## Mevcut Komutlar

-   `npm run dev`: Geliştirme sunucusunu başlatır.
-   `npm run build`: Uygulamayı üretim için `dist` klasörüne build eder.
-   `npm run preview`: Üretim build'ini yerel olarak önizlemek için kullanılır.

## Klasör Yapısı

```
/
├─── src/
│   ├─── assets/         # Statik dosyalar (logo, vb.)
│   ├─── components/     # Tekrar kullanılabilir React componentleri
│   ├─── context/        # React Context API'leri
│   ├─── data/           # Mock data
│   ├─── hooks/          # Özel React hook'ları
│   ├─── pages/          # Sayfa componentleri
│   ├─── services/       # API servisleri
│   └─── styles/         # CSS stilleri
├─── .gitignore
├─── index.html
├─── package.json
└─── vite.config.js
```
