/**
 *  定义产生式
 *      符号(Symbol)
 *          定义语法结构名称
 *      终结符(Terminal Symbol)和非终结符(Non-Terminal Symbol)
 *          终结符：不是由其他符号定义的符号，也就是说他不会出现在产生式的左侧
 *          非终结符：由其他符号经过‘与’、‘或’等逻辑组成的符号
 *      语言定义
 *          语言可以由一个非终结符和它的产生式来定义
 *      语法树
 *          把一段具体的语言文本，根据产生式以属性结构表示出来
 *  产生式的定义
 *      BNF(巴克斯-诺尔范式)
 *          非终结符 使用尖括号包裹
 *          终结符 使用引号包裹
 *          ::= 表示 等于
 *          | 表示 或
 *          <中文>::=<句子>|<中文><句子>
 *          <句子>::=<主语><谓语><宾语>|<主语><谓语>
 *          <主语>::=<代词>|<名词>|<名词性短语>
 *          <代词>::='我'|'你'|'她'
 *      EBNF
 *          非终结符 不使用尖括号包裹
 *          终结符 使用引号包裹
 *          ::= 表示 等于
 *          | 表示 或
 *          {} 表示 零到多个 
 *          [] 表示 零到一个 可以省略
 *          中文::={句子}
 *          句子::=主语 谓语 [宾语]
 *          主语::=代词|名词|名词性短语
 *          代词::='你'|'我'|'他'  
 *  
 *      JavaScript产生式的定义标准
 *          标准连接: https://262.ecma-international.org/#sec-block
 *          举例：
 *              Block
 *                  Syntax描述
 *                      BlockStatement[Yield, Await, Return]:
 *                          Block[?Yield, ?Await, ?Return]
 *                      Block[Yield, Await, Return]:
 *                          {StatementList[?Yield, ?Await, ?Return]opt}
 *                      StatementList[Yield, Await, Return]:
 *                          StatementListItem[?Yield, ?Await, ?Return]
 *                          StatementList[?Yield, ?Await, ?Return]StatementListItem[?Yield, ?Await, ?Return]
 *                      StatementListItem[Yield, Await, Return]:
 *                          Statement[?Yield, ?Await, ?Return]
 *                          Declaration[?Yield, ?Await]
 *          JS的语法描述并非BNF或EBNF，是一种单独的表达方式，但是思想上跟BNF是没有区别的
 *          终结符 加粗表示 
 *              Block[Yield, Await, Return]:
 *                  {StatementList[?Yield, ?Await, ?Return]opt}
 *              这块的{}是加粗的 表示终结符 
 *          非终结符 不加粗 
 *          : 表示 定义 
 *          :前的表达式 表示被定义的非终结符
 *          :后的表达式 表示 定义
 *          换行 表示 或的关系 
 *              StatementListItem:
 *                  Statement
 *                  Declaration
 *              StatementListItem 这个非终结符的定义 要么是 Statement 或者是一个  Declaration
 *      产生式的练习
 *          数学语言四则运算 允许整数的加减乘除
 *              <四则运算>::=<加法算式>
 *              <加法算式>::=(<加法算式> ("+"|"-") <乘法算式>)|<乘法算式>
 *              <乘法算式>::=(<乘法算式> ("*"|"/") <数字>)|<数字>
 *              <数字>::={"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}{"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"}
 *              
 *  遗留问题：
 *      [Yield, Await, Return] 这个是什么意思？           
 * 
*/