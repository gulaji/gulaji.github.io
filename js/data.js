/* ============================================================
   个人学术记录 - 数据中心
   这是你每天编辑的文件！按照下方格式添加新内容即可。
   ============================================================ */

// ==================== 个人信息 ====================
const profile = {
  "name": "黄磊",
  "avatar": "images/hl.jpg",
  "school": "华南理工 大学",
  "major": "机械工程 · 硕士",
  "research": "机械臂+视觉＋传感器",
  "email": "1836825055@qq.com",
  "about": "研究方向聚焦于机械臂的精确控制，致力于利用视觉系统指导机械臂完成精确抓取和简单人机交互。目前在读硕士研究生一年级。",
  "education": [
    {
      "period": "2025 - 至今",
      "school": "华南理工 大学",
      "degree": "硕士 · 机械工程"
    },
    {
      "period": "2021 - 2025",
      "school": "华南理工 大学",
      "degree": "学士 · 机械工程"
    }
  ],
  "skills": [
    "机械臂抓取控制",
    "视觉识别系统",
    "Python",
    "AI工具应用",
    "PDMS倒模",
    "文献检索"
  ],
  "links": {
    "github": "https://github.com/gulaji",
    "googleScholar": " ",
    "researchGate": " "
  }
};

// ==================== 项目进展 ====================
const projects = [
  {
    "id": "projects-1781709801349",
    "name": "人证核验系统",
    "description": "为了满足银行办理业务后，自动进行事后的人员和证件一致性核验检查，完善业务流程。",
    "status": "进行中",
    "startDate": "2026-06-17",
    "timeline": [
      {
        "date": "2026-07-11",
        "title": "demo测试调整优化2",
        "content": "1、针对昨天的第三个问题。提出了D435配置，多帧融合取平均得到特征向量，证件照预处理的方案",
        "private": false
      },
      {
        "date": "2026-07-10",
        "title": "demo测试",
        "content": "1、对项目进行了专门的环境配置，避免后续项目间使用软件版本冲突，造成干扰。\n2、第一次程序运行测试发现相似度值为314，这是不合理的。代码在 face_recognizer.py 中使用了 face.embedding（未归一化，L2 norm ≈ 23），但 cosine_similarity() 直接用 np.dot() 并假定向量已归一化。所以远离-1到1的范围。\n3、实时画面亮度低，匹配相似度只有百分之五十左右。",
        "private": false
      },
      {
        "date": "2026-07-09",
        "title": "项目框架搭好，代码demo初步完成",
        "content": "![项目文件结构总览](images/img_1783587831243.png)",
        "private": false
      },
      {
        "date": "2026-06-17",
        "title": "根据模糊需求，搭建整个系统框架，搜寻了解相关知识、技术、模型。",
        "content": "利用Claude code根据提出的需求搭建整体大概的框架，“人证核验系统计划方案”存在D:\\PersonnelVerification\\docs文件下。由于离线视频身份证识别困难，先简化场景需求，一号摄像头拍摄清晰的身份证，利用SCRFD检测人像后，然后跟二号摄像头拍摄的真实人脸做比对。![屏幕截图 2026-06-17 233143](images/img_1781711175878.png)",
        "private": false
      }
    ]
  },
  {
    "id": "proj-1",
    "name": "银行事后稽核系统",
    "description": "为了满足银行实现信息核验自动化，开发设计银行事后稽核系统，完成业务结束后对身份证、员工卡等信息的核查确认。",
    "status": "进行中",
    "startDate": "2025-04",
    "timeline": [
      {
        "date": "2026-06-16",
        "title": "跟甲方开会讨论",
        "content": "1、视频样本中有图像畸变，停留时间短导致识别准确率低，可通过动作规范调整。\n2、视频识别速度达标（5s），对于身份证出现在视频前端。\n3、lyiping提供样本测试。\n4、对接工作量。",
        "private": false
      },
      {
        "date": "2026-06-11",
        "title": "跟甲方开会对接demo",
        "content": "身份证和员工卡的识别和信息提取功能基本达标，需要更多的样本训练模型提高准却率。"
      },
      {
        "date": "2026-05",
        "title": "搭建代码框架，调整逻辑架构",
        "content": "配置使用环境,写代码demo,测试识别和信息提取"
      },
      {
        "date": "2025-04",
        "title": "项目启动",
        "content": "确定甲方需求，完成行业内常用技术调研。初步计划分三个模块：根据客户需求拟定技术方案、确定技术实现路线，搭建代码框架测试。"
      }
    ]
  },
  {
    "id": "proj-2",
    "name": "人员掏手机动作检测",
    "description": "利用视觉识别模型，检测人员掏出手机的动作，并触发报警信号",
    "status": "进行中",
    "startDate": "2026-03",
    "timeline": [
      {
        "date": "2026-02-10",
        "title": "项目启动与文献阅读",
        "content": "阅读了 5 篇蛋白质互作预测的综述和最新方法论文（DeepPPI、PIPR 等），确定了采用多模态特征 + 随机森林/深度神经网络对比的基线方案。"
      }
    ]
  }
];

// ==================== 实验操作 ====================
const experiments = [
  {
    "id": "experiments-1783588369841",
    "name": "pdms",
    "description": "利用pdms制备出有微观结构的纹理皮肤",
    "status": "进行中",
    "startDate": "2026-07-09",
    "timeline": [
      {
        "date": "2026-06-13",
        "title": "PDMS倒模",
        "content": "完成了从打印清理模具、配置PDMS试剂、倒模全流程。步骤如下：\n1. 切片软件导入3D模型，调整位置，支撑和切片，检测空腔，保存文件。\n2. 光固化打印模具。\n3. 模具清洗，打磨，在紫光灯下正反各照3个小时。65℃烘二十分钟左右\n4. 刷子清洗模具，在模具表面均匀喷洒脱模剂（摇匀距离20cm左右摆动喷洒4次），65℃烘五分钟。\n5. 配PDMS。A：B:加速固化剂为10：1：0.5。加速固化剂最多不超过百分之7，动作慢就少加。A剂和加速固化剂先混合搅匀，然后再加入B剂。防止过快固化\n6. 真空泵抽气约6分钟，直到杯子里没有气泡。\n7. 倒模。将PDMS倒入模具，然后摇平。倒的量高出模具约半毫米为宜。\n8. 真空泵抽气约15到20分钟，直到没有明显气泡溢出。\n9.65℃烘干5小时以上。取出脱模。\n（一次性倒模7个样品，加速固化剂百分之5加多了，导致最后抽真空时已经出现固化现象，需要减少）",
        "private": false
      }
    ]
  }
];

// ==================== 论文写作 ====================
const papers = [
  {
    "id": "paper-1",
    "name": " ",
    "type": "研究论文",
    "target": "Journal of Hepatology",
    "progress": "撰写中",
    "timeline": [
      {
        "date": "2026-06-11",
        "title": "完成文献综述部分初稿",
        "content": "综述了蛋白X在肿瘤中的研究进展，涵盖其结构特征、信号通路、在不同癌症中的表达模式。引用文献 60 余篇。还需要补充近两年（2025-2026）的最新文献。"
      },
      {
        "date": "2026-05-01",
        "title": "确定论文框架",
        "content": "与导师讨论确定了论文整体结构：\n1. 引言（研究背景与意义）\n2. 材料与方法\n3. 结果（分 3-4 个章节）\n4. 讨论\n5. 结论\n目标是投稿 Journal of Hepatology，需按该期刊格式准备。"
      },
      {
        "date": "2026-03-10",
        "title": "论文选题确定",
        "content": "经过与导师三次讨论，确定毕业论文选题围绕蛋白X在肝癌中的功能机制展开。实验数据已有约 60%，还需补做几个关键实验（Co-IP、免疫荧光）。"
      }
    ]
  },
  {
    "id": "paper-2",
    "name": " ",
    "type": "综述论文",
    "target": "Briefings in Bioinformatics",
    "progress": "选题",
    "timeline": [
      {
        "date": "2026-06-01",
        "title": "文献初筛完成",
        "content": "在 PubMed、Web of Science 检索了近三年蛋白质互作预测相关文献，初步筛选出 120 余篇。按方法类别分为：基于序列的方法、基于结构的方法、基于网络的方法、深度学习方法四大类。正在制作对比表格。"
      }
    ]
  }
];

// ==================== 读研生活分享 ====================
const lifeEntries = [
  {
    "date": "2026-07-09",
    "title": "随手记",
    "content": "tkinter 是 Python 官方自带的标准 GUI（图形用户界面）库，全称 Tk interface，依托 Tcl/Tk 图形工具包实现。\n修复tkinter\n需要将真实身份证照片放入 data/id_photos/，编辑 data/id_photos/index.json 匹配你的文件：\n[\n  {\"id\": \"001\", \"name\": \"张三\", \"photo\": \"zhangsan.jpg\"},\n  {\"id\": \"002\", \"name\": \"李四\", \"photo\": \"lisi.jpg\"}\n]",
    "private": false
  }
];

// ==================== 文献笔记 ====================
const readingNotes = [
  {
    "date": "2026-06-10",
    "title": "文献笔记: Deep learning for protein-protein interaction prediction (2025)",
    "content": "<strong>发表于:</strong> Nature Communications<br><strong>关键方法:</strong> 结合序列特征和结构特征的深度神经网络，使用注意力机制融合多模态数据。在 STRING 测试集上 AUC 达到 0.94。<br><strong>启发:</strong> 他们的多模态融合思路可以借鉴，但结构特征获取成本高（需 AlphaFold 预测），对于大规模筛选可能不实用。可以考虑用 ESM-2 嵌入替代结构特征。<br><strong>待跟进:</strong> 作者提到的负采样策略（subcellular co-localization filtering）很有意思，可以降低假阳性。"
  },
  {
    "date": "2026-06-03",
    "title": "文献笔记: The role of Protein X in hepatocellular carcinoma — a systematic review (2024)",
    "content": "<strong>发表于:</strong> Journal of Hepatology<br><strong>关键发现:</strong> 荟萃分析纳入 15 项研究，蛋白X高表达与肝癌患者预后不良显著相关（HR=2.3, p<0.001）。在上游调控中，miR-xxx 是最常报道的调节因子。<br><strong>启发:</strong> 这篇综述的 Table 1 汇总了所有研究中蛋白X的检测方法和表达水平，可以作为我实验方案的参考。另外他们指出的研究空白——缺乏动物模型直接证据——刚好是我课题可以切入的点。"
  },
  {
    "date": "2026-05-20",
    "title": "文献笔记: Benchmarking protein interaction prediction methods (2025)",
    "content": "<strong>发表于:</strong> Bioinformatics<br><strong>关键发现:</strong> 在 12 个基准数据集上比较了 8 种主流预测方法。基于深度学习的方法（DeepPPI、PIPR）在跨物种泛化测试中表现显著优于传统方法（SVM、RF）。但所有方法在处理低丰度蛋白时准确率大幅下降。<br><strong>启发:</strong> 评估方法时一定要关注跨物种泛化性能。后续我自己的模型也要在不同的独立测试集上做充分验证，不能只看单一数据集的指标。<br><strong>实用工具:</strong> 作者提供了标准化的评估脚本（GitHub 有链接），可以直接复用。"
  }
];
