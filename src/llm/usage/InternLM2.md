---
title: 大语言模型 InternLM2（书生·浦语）
date: 2024-01-29
author: JackSu
categories: 
 - 人工智能
tags: 
 - LLM
---

## 介绍

2024 年 1 月 17 日，新一代大语言模型书生·浦语 2.0（InternLM2）正式发布（[GitHub 仓库地址](https://github.com/InternLM/InternLM)）。相比于第一代 InternLM，InternLM2 在推理、对话体验等方面的能力全面提升，工具调用能力整体升级，并支持 20 万字超长上下文，实现长文对话 “大海捞针”。

InternLM2 包含 InternLM2-7B 和 InternLM2-20B 两种模型规格（20B 模型比 7B 模型功能更强大），每种规格又根据不同的应用场景，分为以下四种模型：**InternLM2-Base**、**InternLM2**、**InternLM2-Chat-SFT** 和 **InternLM2-Chat**。其中 **InternLM2** 是官方推荐使用的基础模型，**InternLM2-Chat** 是官方推荐使用的对话模型。下文主要介绍 **InternLM2-Chat-7B** 模型的部署和使用。

| 模型                     | HuggingFace                                                | ModelScope                                                                             |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **InternLM2-Chat-7B**  | [仓库地址](https://huggingface.co/internlm/internlm2-chat-7b)  | [仓库地址](https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm2-chat-7b/summary)  |
| **InternLM2-Chat-20B** | [仓库地址](https://huggingface.co/internlm/internlm2-chat-20b) | [仓库地址](https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm2-chat-20b/summary) |

## 环境准备

[Featurize](https://featurize.cn/) 算力平台提供了高效便捷的在线实验环境，在平台上租用合适的 GPU 实例，部署大模型，方便快捷，省时省力，而且价格亲民。

本人实际部署 **InternLM2-Chat-7B** 模型消耗显存 20 GB 左右（受实际参数配置影响，仅供参考），因此租用一张 RTX 3090 或者 RTX 4090 的 GPU 实例就能满足模型运行条件。

关于 Featurize 平台的使用，建议直接阅读 [官方文档](https://docs.featurize.cn/docs/manual/instance-rent)，上手操作非常简单，在此不在赘述。

## 模型部署&使用

### 页面交互方式

两种部署方式只是页面展示效果不同，并无本质区别，选择其中一种方式部署即可。

#### Gradio

[LMDeploy](https://github.com/InternLM/LMDeploy) 工具中封装了 Gradio，我们使用该工具部署模型。

LMDeploy 所需的运行环境和模型部署代码已整理到下方的脚本文件中，执行脚本文件即可**一键部署**。

首先解释下启动命令中的几个参数含义，各参数取值可根据硬件条件自行调整。

*   `tp（tensor_parallel_size）`：表示使用几张 GPU 来运行一个模型。
*   `max_batch_size`：批处理大小，该参数值越大，吞吐量越高，但会占用更多显存。
*   `cache_max_entry_count`：设置 k/v 缓存大小，会占用显存。当值为 0\~1 之间的小数时，表示 k/v block 使用的内存百分比（例如显存 60 G，该值设置为 0.5，则 k/v 使用的内存总量为 60 \* 0.5 = 30G）。当值 >1 时，表示 k/v block 数量。
*   `./internlm2-chat-7b`：模型本地存储路径。

具体操作步骤如下。

1.  通过 ssh 终端连接到服务器实例，新建 `deploy.sh` 脚本文件，文件内容如下。

~~~sh
cd ~
# 安装运行环境
echo "Installing Python dependencies"
pip install lmdeploy socksio gradio==3.50.2
​
# 安装 Git ltf 扩展包
echo "Installing git lfs extension"
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install -y git-lfs
git lfs install
​
# 拉取模型库
echo "Download repo"
git clone https://huggingface.co/internlm/internlm2-chat-7b
​
# 启动模型
echo "start model"
python3 -m lmdeploy.serve.gradio.app --tp=1 --max_batch_size=64 --cache_max_entry_count=0.1 --server_name=0.0.0.0 --server_port=8888 ./internlm2-chat-7b
~~~
2\.  执行 `sh deploy.sh` 命令启动脚本。脚本执行大约需要 5 分钟时间（模型仓库中有几个大文件）。新开一个终端窗口，执行命令 `watch -n 1 nvidia-smi` 可以实时观察 GPU 资源的使用情况。

![internLM2-01.png](https://s2.loli.net/2024/01/26/GH3XtiEcfK2haOY.png)

1.  模型部署完成，执行下面命令，开放 Featurize 端口。端口开放后 Featurize 会提供公网访问地址。

<!---->
~~~sh
# 开放端口
featurize port export 8888
# 查看已开放的端口
featurize port list
~~~
4\.  访问公网地址，使用模型。

![internLM2-02.png](https://s2.loli.net/2024/01/26/i8pgJ2YQRBIKZxL.png)

#### Streamlit

官方 [GitHub 仓库](https://github.com/InternLM/InternLM) 中提供了使用 Streamlit 部署模型的代码。示例代码默认加载远程 Hugging Face 仓库中的模型，如果已经将模型下载到本地，可以修改源码从本地加载模型。

脚本文件如下，可直接执行，一键部署。
~~~sh
cd ~
​
# 安装环境
pip install streamlit==1.24.0
pip install transformers==4.37.0
​
# 克隆代码
git clone https://github.com/InternLM/InternLM.git
​
# 运行
streamlit run ./InternLM/chat/web_demo.py
~~~
默认启动端口：8501，记得开放 Featurize 端口。交互页面如下所示。

![internLM2-03.png](https://s2.loli.net/2024/01/26/reR23oAXtnk1LKb.png)

### 代码方式

**注意**：代码中`./internlm2-chat-7b` 为模型本地存储路径，请根据实际情况自行调整。

#### Transformers
~~~python
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
​
if __name__ == '__main__':
    # 没有本地模型，替换为 internlm/internlm2-chat-7b
    tokenizer = AutoTokenizer.from_pretrained("./internlm2-chat-7b", trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained("./internlm2-chat-7b", device_map="auto",
                                                  trust_remote_code=True, torch_dtype=torch.float16)
    model = model.eval()
    response, history = model.chat(tokenizer, "你好 我是 JackSu", history=[])
    print(response)
~~~
#### ModelScope
~~~py
import torch
from modelscope import snapshot_download, AutoTokenizer, AutoModelForCausalLM
​
if __name__ == '__main__':
    # 没有本地模型，替换为 Shanghai_AI_Laboratory/internlm2-chat-7b
    model_dir = snapshot_download('./internlm2-chat-7b')
    tokenizer = AutoTokenizer.from_pretrained(model_dir, device_map="auto", trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(model_dir, device_map="auto", trust_remote_code=True,
                                                  torch_dtype=torch.float16)
    model = model.eval()
    response, history = model.chat(tokenizer, "你好 我是 JackSu", history=[])
    print(response)
~~~
#### LMDeploy

[LMDeploy 使用文档](https://lmdeploy.readthedocs.io/zh-cn/latest/inference/pipeline.html#id1)
~~~py
from lmdeploy import pipeline, TurbomindEngineConfig
​
if __name__ == '__main__':
    backend_config = TurbomindEngineConfig(tp=1,
                                            max_batch_size=64,
                                            cache_max_entry_count=0.1)
    # 没有本地模型，替换为 internlm/internlm2-chat-7b
    pipe = pipeline("./internlm2-chat-7b", backend_cofing=backend_cofing)
    response = pipe(["你好 我是 JackSu"])
    print(response)
~~~
## 总结

梳理 InternLM2 的特点，帮助想要使用大语言模型的个人开发者或者企业，在面对众多大语言模型时，能够了解大语言模型提供的能力，并结合自身的需求与成本，做出清晰明确的选择。

*   开源免费、可商用。
*   超长上下文支持：200K token 的输入与理解。（书籍等大文本数据做摘要总结、若干轮对话后回忆之前的内容（大海捞针））
*   支持工具调用能力：能够在一次交互中多次调用工具，完成相对复杂的任务。（Agent）
*   支持微调和训练。（提供专有数据集，打造个人/企业私有化大模型）。

## 末尾

作为一名软件开发人员，大模型的相关应用已经成为我日常工作和生活中的常用工具，本人也在不断跟进了解人工智能的发展情况。

大模型从对话、聊天到工具调用、长文理解，乃至多模态，在不断打破人类认知，带给我们无限的想象空间。

也许未来的某一天，我们可以拥有自己的贾维斯（Friday）。

