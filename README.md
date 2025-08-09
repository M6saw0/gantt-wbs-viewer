## 20250809_ganttchart

WBSとガントチャートをExcelから生成して表示するアプリのリポジトリです。

### 構成
- `data/`: 入力用Excelやテンプレート配置先
  - `templates/`: テンプレート素材
    - `csv/`: CSV（`project_A.csv`, `project_B.csv`, `holidays_template.csv`）
- `docs/`: 仕様や手順ドキュメント
  - `architecture.md`: アプリのアーキテクチャ概要
  - `excel_workbook_setup.md`: Excelブック作成仕様（列定義・表示形式）
- `scripts/`: ユーティリティスクリプト
  - `.venv/`: 仮想環境（任意）
  - `generate_excel_template.py`: CSVからExcelテンプレートを生成
  - `requirements.txt`: 依存パッケージ

---

### 事前準備（テンプレート生成に必要なもの）
- Python 3.10+
- 依存インストール
  - 仮想環境（任意）を使う場合（Linux/macOS）:
    ```
    cd scripts
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt
    ```
  - Windows (PowerShell):
    ```
    cd scripts
    py -3 -m venv .venv
    .venv\Scripts\pip install -r requirements.txt
    ```

---

### Excelテンプレートの作成手順
- 既存のCSVから、プロジェクトA/Bおよび祝日シートを含むExcelテンプレートを生成します。
- 生成後、`data/` 直下にコピーしてアプリの入力として利用してください。

手順（Linux/macOS）
```
# 生成
.venv/bin/python generate_excel_template.py

# 出力場所（テンプレート）
# data/templates/projects_template.xlsx

# アプリ入力として利用するために data/ にコピー
cp data/templates/projects_template.xlsx data/projects.xlsx
```

手順（Windows PowerShell）
```
# 生成
.venv\Scripts\python generate_excel_template.py

# 出力場所（テンプレート）
# data\templates\projects_template.xlsx

# アプリ入力として利用するために data\ にコピー
Copy-Item data\templates\projects_template.xlsx data\projects.xlsx
```

- 列仕様や表示形式の詳細は `docs/excel_workbook_setup.md` を参照してください。
- 祝日は同一ブック内の `祝日` シートで管理します（互換で `Holidays` も認識）。

